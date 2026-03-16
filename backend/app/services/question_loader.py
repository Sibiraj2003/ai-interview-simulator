import json

def load_questions():

    with open("app/data/interview_questions.json", "r") as f:
        data = json.load(f)

    return data