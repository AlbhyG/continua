"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface AxisResult {
  axis: string;
  name: string;
  score: number;
  label: string;
  highLabel: string;
  lowLabel: string;
}

interface ResultData {
  scores: Record<string, number>;
  axisResults: AxisResult[];
  shareLink: string;
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id;

  const [result, setResult] = useState<ResultData | null>(null);
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
    <div className="mx-auto max-w-2xl px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-white">Your Profile</h1>
      <p className="mt-2 text-white/50 text-sm">
        Your position across 6 personality dimensions
      </p>

      {/* Axis scores */}
      <div className="mt-8 flex flex-col gap-4">
        {result.axisResults.map((ar) => (
          <div key={ar.axis} className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white/80">{ar.name}</span>
              <span className="text-sm font-bold text-white">{ar.score}</span>
            </div>
            {/* Score bar */}
            <div className="relative h-2 rounded-full bg-white/10">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-white/50 transition-all duration-500"
                style={{ width: `${((ar.score - 1) / 9) * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-white/30">
              <span>{ar.highLabel}</span>
              <span>{ar.lowLabel}</span>
            </div>
          </div>
        ))}
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
    </div>
  );
}
