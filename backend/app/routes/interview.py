from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel

from app.services.question_generator import generate_question
from app.services.answer_evaluator import evaluate_answer
from app.services.feedback_generator import generate_feedback
from app.services.video_analyzer import analyze_frame
from app.services.video_processor import process_video
from app.services.audio_transcriber import transcribe_audio
from app.services import interview_manager

import os
import shutil

router = APIRouter()

# ---------------- START INTERVIEW ----------------

@router.get("/start/{role}")
def start(role: str, difficulty: str = "medium", total_questions: int = 5):

    session_id = interview_manager.start_interview(role, difficulty, total_questions)

    return {
        "message": "Interview started",
        "session_id": session_id
    }


# ---------------- GET QUESTION ----------------

@router.get("/question/{session_id}")
def get_question(session_id: str):

    session = interview_manager.get_session(session_id)

    if session is None:
        return {"error": "Invalid session"}

    if len(session["questions"]) >= session["total_questions"]:
        return {"message": "Interview completed"}

    role = session["role"]
    # question_number = len(session["questions"])

    difficulty = interview_manager.get_current_difficulty(session_id)

    data = generate_question(role, difficulty)

    if not data:
        return {"error": "Could not fetch question"}

    # Store full question object in session
    interview_manager.store_question(session_id, data)

    return {
        "question": data["question"],
        "option_a": data["option_a"],
        "option_b": data["option_b"],
        "option_c": data["option_c"],
        "option_d": data["option_d"],
        "difficulty": data.get("difficulty"),
        "type": data.get("type", "mcq")
    }


# ---------------- ANSWER SUBMISSION ----------------

class AnswerSubmission(BaseModel):
    session_id: str
    user_answer: str   # A / B / C / D


@router.post("/evaluate")
def evaluate(data: AnswerSubmission):

    session_id = data.session_id
    user_answer = data.user_answer.upper()

    session = interview_manager.get_session(session_id)

    if session is None:
        return {"error": "Invalid session"}

    question_data = interview_manager.get_current_question(session_id)

    if question_data is None:
        return {"error": "No active question"}

    correct_option = question_data["correct_option"]

    result = evaluate_answer(user_answer, correct_option)
    score = result["score"]

    feedback = generate_feedback(
        question_data["question"],
        correct_option,
        user_answer,
        score
    )

    interview_manager.evaluate_and_store(session_id, score)
    interview_manager.update_difficulty(session_id, score)

    interview_manager.store_result(
        session_id,
        question_data["question"],
        user_answer,
        score,
        0
    )

    return {
        "score": score,
        "feedback": feedback,
        "correct_option": correct_option
    }


# ---------------- FINAL RESULT ----------------

@router.get("/result/{session_id}")
def result(session_id: str):

    session = interview_manager.get_session(session_id)

    if session is None:
        return {"error": "Invalid session"}

    scores = session["scores"]

    avg = sum(scores) / len(scores) if scores else 0

    return {
        "questions_asked": len(session["questions"]),
        "scores": scores,
        "average_score": avg
    }


# ---------------- VIDEO ANALYZE ----------------

@router.post("/video-analyze")
async def video_analyze(file: UploadFile = File(...)):

    image_bytes = await file.read()

    result = analyze_frame(image_bytes)

    return result


# ---------------- VIDEO ANSWER ----------------

@router.post("/video-answer")
async def video_answer(
    session_id: str = Form(...),
    file: UploadFile = File(...)
):

    session = interview_manager.get_session(session_id)

    if session is None:
        return {"error": "Invalid session"}

    os.makedirs("temp", exist_ok=True)

    video_path = f"temp/{file.filename}"

    with open(video_path, "wb") as f:
        f.write(await file.read())

    try:

        audio_path, frames_folder = process_video(video_path)

        result = transcribe_audio(audio_path)

        transcript = result["text"]

        # Engagement detection
        engagement_data = []
        max_faces = 0

        frames = os.listdir(frames_folder)[:30]

        for frame in frames:

            frame_path = f"{frames_folder}/{frame}"

            with open(frame_path, "rb") as img:

                analysis = analyze_frame(img.read())

                engagement_data.append(analysis)

                max_faces = max(max_faces, analysis["face_count"])

        focused_count = sum(
            1 for e in engagement_data if e["engagement"] == "focused"
        )

        engagement_score = focused_count / len(engagement_data) if engagement_data else 0

        return {
            "transcript": transcript,
            "engagement_score": engagement_score,
            "face_count": max_faces
        }

    finally:

        if os.path.exists(video_path):
            os.remove(video_path)

        if 'audio_path' in locals() and os.path.exists(audio_path):
            os.remove(audio_path)

        if 'frames_folder' in locals() and os.path.exists(frames_folder):
            shutil.rmtree(frames_folder)


# ---------------- HISTORY ----------------

@router.get("/history/{session_id}")
def interview_history(session_id: str):

    conn = interview_manager.get_connection()
    cursor = conn.cursor()
    session = interview_manager.get_session(session_id)
    limit = session["total_questions"]

    cursor.execute("""
    SELECT question, user_answer, score, engagement_score
    FROM questions
    WHERE session_id=%s
    ORDER BY id ASC
    LIMIT %s
    """, (session_id, limit))

    rows = cursor.fetchall()
    conn.close()

    history = []
    scores = []
    engagements = []

    for r in rows:

        scores.append(r["score"])
        engagements.append(r["engagement_score"])

        history.append({
            "question": r["question"],
            "answer": r["user_answer"],
            "score": r["score"],
            "engagement": r["engagement_score"]
        })

    avg_score = sum(scores) / len(scores) if scores else 0
    avg_engagement = sum(engagements) / len(engagements) if engagements else 0

    return {
        "session_id": session_id,
        "questions": history,
        "average_score": avg_score,
        "average_engagement": avg_engagement,
        "total_questions": len(history)
    }


# ---------------- PROCTOR FRAME ----------------

@router.post("/proctor/frame")
async def analyze_proctor_frame(file: UploadFile = File(...)):

    image_bytes = await file.read()

    result = analyze_frame(image_bytes)

    return {
        "faces": result["faces_detected"],
        "engagement": result["engagement"],
        "direction": result["head_direction"]
    }