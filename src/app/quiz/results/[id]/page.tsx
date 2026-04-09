"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const HistoryChart = dynamic(
  () => import("@/components/quiz/HistoryChart"),
  {
    ssr: false,
    loading: () => <p className="text-sm text-white/40">Loading chart...</p>,
  }
);

interface ResultData {
  score: number;
  label: string;
  explanation: string;
  shareLink: string;
}

interface HistoryEntry {
  id: number;
  questionnaire_id: number;
  score: number;
  taken_at: string;
}

interface HistoryData {
  results: HistoryEntry[];
  average: number | null;
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id;

  const [result, setResult] = useState<ResultData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${resultId}`);
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      fetch(`/quiz/api/results/${resultId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then(setResult)
        .catch(() => {});
    }

    fetch("/quiz/api/history")
      .then((res) => res.json())
      .then(setHistory);
  }, [resultId]);

  async function takeAnother() {
    const res = await fetch("/quiz/api/random");
    if (!res.ok) {
      const data = await res.json();
      if (data.error === "all_completed") {
        alert("You've completed all available questionnaires!");
        return;
      }
      return;
    }
    const { id } = await res.json();
    router.push(`/quiz/take/${id}`);
  }

  function copyShareLink() {
    if (!result) return;
    const url = window.location.origin + result.shareLink;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-white/70">Loading result...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold text-white">Your Result</h1>
      </div>

      {/* Score card */}
      <div className="mt-8 rounded-xl bg-white/5 border border-white/10 p-6 text-center">
        <div className="text-7xl font-bold text-white">{result.score}</div>
        <div className="mt-2 text-2xl font-bold text-white/90">
          {result.label}
        </div>
      </div>

      <div className="mt-8 text-white/60 leading-relaxed">
        <p>{result.explanation}</p>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={takeAnother}
          className="w-full rounded-xl bg-white/90 px-4 py-4 text-sm font-bold text-black transition-all hover:bg-white"
        >
          Take Another Quiz
        </button>
        <button
          onClick={copyShareLink}
          className="w-full rounded-xl bg-white/10 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-white/20"
        >
          {copied ? "Link Copied!" : "Share Result"}
        </button>
      </div>

      {/* Score History */}
      {history && history.results.length > 0 && (
        <div className="mt-12 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Your History</h2>
            {history.average !== null && (
              <p className="mt-1 text-white/60">
                Running Average:{" "}
                <strong className="text-white">{history.average}</strong>
              </p>
            )}
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <HistoryChart data={history.results} />
          </div>
        </div>
      )}
    </div>
  );
}
