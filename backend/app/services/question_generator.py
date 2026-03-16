from app.services.question_bank import get_question


# ---------------- MAIN QUESTION ENGINE ----------------

def generate_question(role, difficulty):
    """
    Generates a question using the requested difficulty.
    Difficulty is now controlled by the adaptive interview engine.
    """

    print(f"\nFetching question for {role} | {difficulty}")

    # Fetch from PostgreSQL question bank
    db_question = get_question(role, difficulty)

    if not db_question:

        print("No question found in database")

        return None

    print("Using DATABASE question")

    return {
        "question": db_question["question"],
        "option_a": db_question["option_a"],
        "option_b": db_question["option_b"],
        "option_c": db_question["option_c"],
        "option_d": db_question["option_d"],
        "correct_option": db_question["correct_option"],
        "difficulty": db_question.get("difficulty", difficulty),
        "type": db_question.get("type", "mcq"),
        "source": "database"
    }