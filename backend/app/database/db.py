import psycopg2
from psycopg2.extras import RealDictCursor


def get_connection():
    conn = psycopg2.connect(
        dbname="ai_interview_simulator",
        user="postgres",
        password="sibi@2003",
        host="localhost",
        port="5432",
        cursor_factory=RealDictCursor
    )
    return conn