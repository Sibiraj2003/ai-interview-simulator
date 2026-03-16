from fastapi import APIRouter
from app.database.db import get_connection
from app.services.python_runner import run_python_code
from app.services.sql_runner import run_sql_query
from psycopg2.extras import RealDictCursor

router = APIRouter(prefix="/coding", tags=["Coding Arena"])


# -------------------------------
# Get Coding Questions
# -------------------------------
@router.get("/questions")
def get_questions(arena_type: str):

    conn = get_connection()

    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
    SELECT *
    FROM coding_questions
    WHERE arena_type = %s
    ORDER BY
        CASE difficulty
            WHEN 'easy' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'hard' THEN 3
        END
    LIMIT 4
    """

    cur.execute(query, (arena_type,))
    questions = cur.fetchall()

    cur.close()
    conn.close()

    return questions


# -------------------------------
# Python Code Runner
# -------------------------------
@router.post("/run-python")
def run_python(payload: dict):

    code = payload["code"]
    test_cases = payload["test_cases"]

    results = run_python_code(code, test_cases)

    return {"results": results}


# -------------------------------
# SQL Query Runner
# -------------------------------
@router.post("/run-sql")
def run_sql(payload: dict):

    query = payload["query"]
    expected = payload.get("expected_result")

    result = run_sql_query(query, expected)

    return result