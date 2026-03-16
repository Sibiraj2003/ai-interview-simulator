import { useEffect, useState } from "react";
import medievalBg from "../assets/medieval-bg.jpg";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function ResultPage({ sessionId }: any) {

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchResults = async () => {

      try {

        const res = await fetch(
          `http://127.0.0.1:8000/history/${sessionId}`
        );

        const data = await res.json();

        /* ---------------- FIX DUPLICATE QUESTIONS ---------------- */

        const filteredQuestions = data.questions.slice(0, data.total_questions);

        data.questions = filteredQuestions;

        setResults(data);
        setLoading(false);

      } catch (err) {

        console.error("Failed to load results:", err);
        setLoading(false);

      }

    };

    fetchResults();

  }, [sessionId]);

  if (loading) {

    return (
      <div
        className="min-h-screen flex items-center justify-center text-white text-xl"
        style={{ backgroundImage: `url(${medievalBg})` }}
      >
        ⚔ The guild masters are evaluating your trial...
      </div>
    );

  }

  if (!results) {

    return (
      <div
        className="min-h-screen flex items-center justify-center text-white text-xl"
        style={{ backgroundImage: `url(${medievalBg})` }}
      >
        No guild verdict found.
      </div>
    );

  }

  /* ---------------- CHART DATA ---------------- */

  const scoreChart = {

    labels: results.questions.map((_: any, i: number) => `Trial ${i + 1}`),

    datasets: [
      {
        label: "Score",
        data: results.questions.map((q: any) => q.score),
        backgroundColor: "rgba(34,197,94,0.8)"
      }
    ]

  };

  const engagementChart = {

    labels: results.questions.map((_: any, i: number) => `Trial ${i + 1}`),

    datasets: [
      {
        label: "Engagement",
        data: results.questions.map((q: any) => q.engagement),
        backgroundColor: "rgba(59,130,246,0.8)"
      }
    ]

  };

  /* ---------------- RANK SYSTEM ---------------- */

  const avg = results.average_score;

  let rank = "Novice";

  if (avg > 8) rank = "Guild Master";
  else if (avg > 6) rank = "Elite Knight";
  else if (avg > 4) rank = "Apprentice";

  return (

    <div
      className="min-h-screen p-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${medievalBg})` }}
    >

      {/* TITLE */}

      <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
        🏆 Guild Verdict Hall
      </h1>

      {/* SUMMARY PANEL */}

      <div className="bg-black/70 backdrop-blur-lg text-white p-6 rounded-xl border border-yellow-600 mb-8">

        <h2 className="text-2xl font-bold text-yellow-400 mb-4">
          Final Guild Verdict
        </h2>

        <div className="grid grid-cols-4 gap-6 text-center">

          <div>
            <p className="text-yellow-300">Trials Completed</p>
            <p className="text-xl font-bold">{results.questions.length}</p>
          </div>

          <div>
            <p className="text-yellow-300">Average Score</p>
            <p className="text-xl font-bold">
              {results.average_score?.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-yellow-300">Engagement</p>
            <p className="text-xl font-bold">
              {results.average_engagement?.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-yellow-300">Guild Rank</p>
            <p className="text-xl font-bold text-green-400">
              {rank}
            </p>
          </div>

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-2 gap-8 mb-10">

        <div className="bg-black/70 text-white p-6 rounded-xl border border-yellow-600">

          <h3 className="text-xl font-bold mb-4 text-yellow-300">
            ⚔ Score per Trial
          </h3>

          <Bar data={scoreChart} />

        </div>

        <div className="bg-black/70 text-white p-6 rounded-xl border border-yellow-600">

          <h3 className="text-xl font-bold mb-4 text-yellow-300">
            👁 Engagement per Trial
          </h3>

          <Bar data={engagementChart} />

        </div>

      </div>

      {/* QUESTION REVIEW */}

      <div className="space-y-6">

        {results.questions.map((q: any, index: number) => (

          <div
            key={index}
            className="bg-black/70 text-white p-6 rounded-xl border border-yellow-600"
          >

            <h3 className="text-xl font-bold text-yellow-300">
              Trial {index + 1}
            </h3>

            <p className="mt-3">
              <strong>Question:</strong> {q.question}
            </p>

            <p className="mt-3">
              <strong>Your Answer:</strong> {q.answer}
            </p>

            <p className="mt-3 text-green-400">
              <strong>Score:</strong> {q.score}
            </p>

            <p className="text-blue-400">
              <strong>Engagement:</strong> {q.engagement}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}