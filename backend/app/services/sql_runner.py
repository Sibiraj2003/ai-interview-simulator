from psycopg2.extras import RealDictCursor
from app.database.db import get_connection


def normalize_rows(rows):
    """
    Convert rows into sorted tuples so order differences
    don't break comparisons.
    """
    normalized = []

    for r in rows:
        # sort keys so column order doesn't matter
        normalized.append(tuple(sorted(r.items())))

    # sort rows so row order doesn't matter
    return sorted(normalized)


def run_sql_query(user_query, expected_result):

    conn = get_connection()

    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        # execute user's SQL
        cur.execute(user_query)

        rows = cur.fetchall()

        # rows already dictionaries
        results = [dict(r) for r in rows]

        correct = False

        if expected_result is not None:

            try:

                correct = normalize_rows(results) == normalize_rows(expected_result)

            except Exception:
                correct = False

        return {
            "rows": results,
            "correct": correct
        }

    except Exception as e:

        return {
            "error": str(e)
        }

    finally:

        cur.close()
        conn.close()