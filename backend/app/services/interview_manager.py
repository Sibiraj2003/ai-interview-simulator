import uuid
from app.database.db import get_connection

# ---------------- SESSION STORAGE ----------------

sessions = {}


# ---------------- DIFFICULTY ORDER ----------------

DIFFICULTY_LEVELS = ["easy", "medium", "hard"]


# ---------------- START INTERVIEW ----------------

def start_interview(role, difficulty, total_questions):
    """
    Creates a new interview session.
    Stores session in memory and database.
    """

    session_id = str(uuid.uuid4())

    sessions[session_id] = {
        "role": role,
        "difficulty": difficulty,
        "questions": [],
        "scores": [],
        "total_questions": total_questions
    }

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO interviews (session_id, role) VALUES (%s, %s)",
        (session_id, role)
    )

    conn.commit()
    conn.close()

    return session_id


# ---------------- STORE QUESTION ----------------

def store_question(session_id, question_data):
    """
    Stores full MCQ question object in session.
    """

    session = sessions.get(session_id)

    if session is None:
        return

    session["questions"].append(question_data)


# ---------------- GET CURRENT QUESTION ----------------

def get_current_question(session_id):
    """
    Returns the last asked question object.
    """

    session = sessions.get(session_id)

    if session is None:
        return None

    if len(session["questions"]) == 0:
        return None

    return session["questions"][-1]


# ---------------- GET CURRENT DIFFICULTY ----------------

def get_current_difficulty(session_id):
    """
    Returns the current adaptive difficulty.
    """

    session = sessions.get(session_id)

    if session is None:
        return "medium"

    return session["difficulty"]


# ---------------- UPDATE DIFFICULTY ----------------

def update_difficulty(session_id, score):
    """
    Adjust difficulty based on score.
    """

    session = sessions.get(session_id)

    if session is None:
        return

    current = session["difficulty"]

    idx = DIFFICULTY_LEVELS.index(current)

    # correct answer → harder
    if score >= 1 and idx < len(DIFFICULTY_LEVELS) - 1:
        idx += 1

    # wrong answer → easier
    elif score == 0 and idx > 0:
        idx -= 1

    session["difficulty"] = DIFFICULTY_LEVELS[idx]


# ---------------- STORE SCORE ----------------

def evaluate_and_store(session_id, score):
    """
    Store evaluation score in runtime session.
    """

    session = sessions.get(session_id)

    if session is None:
        return

    session["scores"].append(score)


# ---------------- GET SESSION ----------------

def get_session(session_id):
    """
    Returns full session runtime data.
    """

    return sessions.get(session_id)


# ---------------- STORE RESULT ----------------

def store_result(session_id, question, user_answer, score, engagement_score):

    conn = get_connection()
    cursor = conn.cursor()

    # Check if this question already stored
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM questions
        WHERE session_id=%s AND question=%s
    """, (session_id, question))

    row = cursor.fetchone()
    exists = list(row.values())[0]

    if exists > 0:
        conn.close()
        return

    cursor.execute("""
        INSERT INTO questions
        (session_id, question, user_answer, score, engagement_score)
        VALUES (%s, %s, %s, %s, %s)
    """, (session_id, question, user_answer, score, engagement_score))

    conn.commit()
    conn.close()


# ---------------- GET FINAL RESULTS ----------------

def get_interview_results(session_id):
    """
    Calculates average score from DB.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT score FROM questions WHERE session_id=%s",
        (session_id,)
    )

    rows = cursor.fetchall()

    conn.close()

    scores = [row["score"] for row in rows]

    if not scores:
        return 0

    return sum(scores) / len(scores)