import re

# ---------------- NORMALIZE USER ANSWER ----------------

def normalize_answer(ans: str) -> str:
    """
    Normalize different user inputs like:
    'a', 'A', 'option a', 'Option B', etc.
    """

    if not ans:
        return ""

    ans = ans.strip().upper()

    # remove 'OPTION'
    ans = re.sub(r"OPTION\s*", "", ans)

    # keep only first character
    ans = ans[0]

    if ans in ["A", "B", "C", "D"]:
        return ans

    return ""


# ---------------- MCQ EVALUATION ----------------

def evaluate_answer(user_answer: str, correct_option: str):
    """
    Compare user answer with correct option.

    Returns score from 0 to 10.
    """

    user = normalize_answer(user_answer)
    correct = correct_option.strip().upper()

    if user == correct:
        score = 10
    else:
        score = 0

    return {
        "score": score
    }