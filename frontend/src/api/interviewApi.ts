import axios from "axios";

const API = "http://127.0.0.1:8000";

export const startInterview = async (
  role: string,
  difficulty: string,
  totalQuestions: number
) => {

  const res = await fetch(
    `http://localhost:8000/start/${role}?difficulty=${difficulty}&total_questions=${totalQuestions}`
  );

  return res.json();
};

export const getQuestion = async (sessionId: string) => {

  const res = await axios.get(`${API}/question/${sessionId}`);

  return res.data;
};

export async function evaluateAnswer(sessionId: string, answer: string) {

  const res = await fetch("http://127.0.0.1:8000/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session_id: sessionId,
      user_answer: answer
    })
  });

  return res.json();
}

export const getResult = async (sessionId: string) => {

  const res = await axios.get(`${API}/result/${sessionId}`);

  return res.data;
};

