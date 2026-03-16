from app.database.db import get_connection
from psycopg2.extras import RealDictCursor


def get_question(role, difficulty):

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute(
        """
        SELECT
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            difficulty,
            role
        FROM question_bank
        WHERE role = %s AND difficulty = %s
        ORDER BY RANDOM()
        LIMIT 1
        """,
        (role, difficulty)
    )

    result = cursor.fetchone()

    conn.close()

    if not result:
        return None

    return {
        "question": result["question"],
        "option_a": result["option_a"],
        "option_b": result["option_b"],
        "option_c": result["option_c"],
        "option_d": result["option_d"],
        "correct_option": result["correct_option"],
        "difficulty": result["difficulty"],
        "type": "mcq",
        "source": "database"
    }