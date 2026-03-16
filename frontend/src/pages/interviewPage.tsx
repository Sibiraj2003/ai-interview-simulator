import { useState, useEffect, useRef } from "react";
import { startInterview, getQuestion, evaluateAnswer } from "../api/interviewApi";
import ResultPage from "./ResultPage";
import VideoRecorder from "../components/VideoRecorder";
import medievalBg from "../assets/medieval-bg.jpg";

export default function InterviewPage() {

  const [role, setRole] = useState("");
  const [sessionId, setSessionId] = useState("");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<any>({});

  const [difficulty, setDifficulty] = useState("medium");
  const [type, setType] = useState("");

  const [selectedOption, setSelectedOption] = useState("");

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [flags, setFlags] = useState<boolean[]>([]);

  const [score, setScore] = useState<number | null>(null);

  const [questionNumber, setQuestionNumber] = useState(1);
  const [finished, setFinished] = useState(false);

  const [timeLeft, setTimeLeft] = useState(60);

  const [selectedQuestionCount, setSelectedQuestionCount] = useState(5);

  const [proctorViolations, setProctorViolations] = useState(0);

  const scorePanelRef = useRef<HTMLDivElement | null>(null);

  const totalQuestions = selectedQuestionCount;

  /* ---------------- TIMER ---------------- */

  const handleTimeout = async () => {

    if (score !== null) return;

    const res = await evaluateAnswer(sessionId, selectedOption || "X");

    setScore(res.score);

  };

  useEffect(() => {

    if (!sessionId) return;
    if (score !== null) return;

    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {

          clearInterval(timer);
          handleTimeout();
          return 0;

        }

        return prev - 1;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, [sessionId, questionNumber, score]);

  /* ---------------- PROCTOR VIOLATION LIMIT ---------------- */

  useEffect(() => {

    if (proctorViolations >= 10) {

      alert("⚠ Proctor violation detected. Interview terminated.");

      setFinished(true);

    }

  }, [proctorViolations]);

  /* ---------------- TAB SWITCH DETECTION ---------------- */

  useEffect(() => {

    const handleVisibility = () => {

      if (document.hidden) {

        alert("⚠ Tab switching detected. Interview terminated.");

        setFinished(true);

      }

    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {

      document.removeEventListener("visibilitychange", handleVisibility);

    };

  }, []);

  /* ---------------- WINDOW BLUR DETECTION ---------------- */

  useEffect(() => {

    const handleBlur = () => {

      alert("⚠ Leaving interview window detected.");

      setFinished(true);

    };

    window.addEventListener("blur", handleBlur);

    return () => {

      window.removeEventListener("blur", handleBlur);

    };

  }, []);

  /* ---------------- START INTERVIEW ---------------- */

  const start = async () => {

    const res = await startInterview(role, difficulty, selectedQuestionCount);

    setSessionId(res.session_id);

    const q = await getQuestion(res.session_id);

    setQuestion(q.question);

    setOptions({
      A: q.option_a,
      B: q.option_b,
      C: q.option_c,
      D: q.option_d
    });

    setDifficulty(q.difficulty || "");
    setType(q.type || "");

    setQuestions([q.question]);
    setAnswers([""]);
    setFlags([false]);

  };

  /* ---------------- SUBMIT ANSWER ---------------- */

  const submitAnswer = async () => {

    if (!selectedOption) {

      alert("Select an option first");
      return;

    }

    const res = await evaluateAnswer(sessionId, selectedOption);

    setScore(res.score);

    setAnswers((prev) => {

      const updated = [...prev];
      updated[questionNumber - 1] = selectedOption;

      return updated;

    });

    setTimeout(() => {

      scorePanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }, 200);

  };

  /* ---------------- NEXT QUESTION ---------------- */

  const nextQuestion = async () => {

    const nextNum = questionNumber + 1;

    if (nextNum > totalQuestions) {

      setFinished(true);
      return;

    }

    const q = await getQuestion(sessionId);

    setQuestions((prev) => [...prev, q.question]);
    setAnswers((prev) => [...prev, ""]);
    setFlags((prev) => [...prev, false]);

    setQuestion(q.question);

    setOptions({
      A: q.option_a,
      B: q.option_b,
      C: q.option_c,
      D: q.option_d
    });

    setDifficulty(q.difficulty || "");
    setType(q.type || "");

    setQuestionNumber(nextNum);

    setScore(null);
    setSelectedOption("");

    setTimeLeft(60);

  };

  /* ---------------- PREVIOUS QUESTION ---------------- */

  const prevQuestion = () => {

    if (questionNumber === 1) return;

    const prevIndex = questionNumber - 2;

    setQuestionNumber(questionNumber - 1);
    setQuestion(questions[prevIndex]);
    setSelectedOption(answers[prevIndex] || "");

    setScore(null);
    setTimeLeft(60);

  };

  /* ---------------- FLAG QUESTION ---------------- */

  const toggleFlag = () => {

    setFlags((prev) => {

      const updated = [...prev];
      updated[questionNumber - 1] = !updated[questionNumber - 1];

      return updated;

    });

  };

  /* ---------------- FINISH INTERVIEW ---------------- */

  const finishInterview = () => {

    setFinished(true);

  };

  /* ---------------- RESULT PAGE ---------------- */

  if (finished) {

    return <ResultPage sessionId={sessionId} />;

  }

  /* ---------------- UI ---------------- */

  return (

    <div
      className="flex h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${medievalBg})` }}
    >

      {/* SIDEBAR */}

      <div className="w-72 bg-black/60 backdrop-blur-md text-white p-6 shadow-2xl">

        <h2 className="text-2xl font-bold mb-6 text-yellow-300">
          ⚔ Guild Trials
        </h2>

        {questions.map((_, index) => {

          const answered = answers[index] !== "";
          const flagged = flags[index];

          return (

            <button
              key={index}
              className={`w-full mb-3 py-2 rounded-lg transition ${
                index + 1 === questionNumber
                  ? "bg-yellow-700"
                  : answered
                  ? "bg-green-700"
                  : "bg-gray-700"
              }`}
            >
              Trial {index + 1} {flagged ? "⚑" : ""}
            </button>

          );

        })}

      </div>

      {/* MAIN PANEL */}

      <div className="flex-1 p-10 overflow-auto">

        <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
          🏰 Guild Trial Simulator
        </h1>

        <p className="text-gray-200 mb-6 italic">
          Prove your coding mastery to the guild masters.
        </p>

        {/* WARNING BANNER */}

        {proctorViolations > 0 && (

          <div className="bg-red-700 text-white p-3 rounded mb-4">

            ⚠ Proctor Warning — Stay focused  
            Violations: {proctorViolations}/10

          </div>

        )}

        {/* START SCREEN */}

        {!sessionId && (

          <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-[420px]">

            <h3 className="text-lg font-semibold mb-4">
              Choose Your Discipline
            </h3>

            <select
              className="border p-3 rounded w-full mb-4"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
              <option value="ml">Machine Learning</option>
            </select>

            <select
              className="border p-3 rounded w-full mb-4"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="border p-3 rounded w-full mb-4"
              value={selectedQuestionCount}
              onChange={(e) => setSelectedQuestionCount(Number(e.target.value))}
            >
              <option value={5}>5 Trials</option>
              <option value={10}>10 Trials</option>
              <option value={15}>15 Trials</option>
            </select>

            <button
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-red-700 text-white rounded-lg shadow hover:scale-105 transition"
              onClick={start}
            >
              ⚔ Begin Trial
            </button>

          </div>

        )}

        {/* PROCTOR CAMERA */}

        {sessionId && (
          <div className="mb-6">
            <VideoRecorder
              sessionId={sessionId}
              onViolation={() => setProctorViolations(v => v + 1)}
            />
          </div>
        )}

        {/* QUESTION CARD */}

        {question && (

          <div className="bg-white/90 p-8 rounded-2xl shadow-2xl border border-yellow-700">

            <p className="mb-4 text-gray-700">
              ⏱ Time left: {timeLeft}s
            </p>

            <pre className="text-gray-900 bg-gray-100 p-4 rounded-lg whitespace-pre-wrap font-mono mb-6">
              <code>{question}</code>
            </pre>

            <div className="space-y-3">

              {Object.entries(options).map(([key, value]) => (

                <button
                  key={key}
                  onClick={() => setSelectedOption(key)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedOption === key
                      ? "bg-yellow-600 text-white"
                      : "bg-yellow-50 border-yellow-700"
                  }`}
                >
                  <b>{key}</b> {value as string}
                </button>

              ))}

            </div>

            {/* CONTROL BAR */}

            <div className="flex gap-3 mt-6 flex-wrap">

              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                onClick={prevQuestion}
                disabled={questionNumber === 1}
              >
                ⬅ Previous
              </button>

              <button
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
                onClick={toggleFlag}
              >
                ⚑ Flag
              </button>

              <button
                className="px-4 py-2 bg-red-700 text-white rounded-lg"
                onClick={submitAnswer}
              >
                ⚔ Submit
              </button>

              <button
                className="px-4 py-2 bg-blue-700 text-white rounded-lg"
                onClick={nextQuestion}
                disabled={score === null}
              >
                Next ➡
              </button>

              <button
                className="px-4 py-2 bg-black text-white rounded-lg"
                onClick={finishInterview}
              >
                🏁 Finish
              </button>

            </div>

          </div>

        )}

        {/* SCORE */}

        {score !== null && (

          <div
            ref={scorePanelRef}
            className="mt-6 bg-white/90 p-6 rounded-xl shadow-xl"
          >

            <h3 className="text-xl font-bold text-green-700">
              Guild Score: {score}
            </h3>

          </div>

        )}

      </div>

    </div>

  );

}