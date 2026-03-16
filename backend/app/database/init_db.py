from app.database.db import get_connection


def init_db():

    conn = get_connection()
    cursor = conn.cursor()

    # Interview session table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interviews (
        session_id TEXT PRIMARY KEY,
        role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Questions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        session_id TEXT REFERENCES interviews(session_id) ON DELETE CASCADE,
        question TEXT,
        expected_answer TEXT,
        user_answer TEXT,
        score DOUBLE PRECISION,
        engagement_score DOUBLE PRECISION,
        face_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()

    print("PostgreSQL tables initialized.")


if __name__ == "__main__":
    init_db()