from transformers import pipeline

feedback_model = pipeline(
    "text-generation",
    model="google/flan-t5-base"
)


def generate_feedback(question, expected_answer, user_answer, score):

    prompt = f"""
You are a technical interviewer.

Question:
{question}

Expected Answer:
{expected_answer}

Candidate Answer:
{user_answer}

Score: {score}/10

Give short constructive feedback.
Mention what was correct and what is missing.
"""

    result = feedback_model(
        prompt,
        max_new_tokens=120,
        temperature=0.7,
        do_sample=True
    )

    text = result[0]["generated_text"]
    feedback = text.replace(prompt, "").strip()

    # fallback if model returns nothing
    if feedback == "":
        if score > 8:
            feedback = "Good answer. You covered the key idea, but you could add more explanation."
        elif score > 5:
            feedback = "Your answer is partially correct but lacks explanation."
        else:
            feedback = "Your answer is too short or incorrect. Review the concept and try again."

    return feedback