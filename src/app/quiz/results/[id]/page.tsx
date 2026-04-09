"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RadarProfile = dynamic(
  () => import("@/components/quiz/RadarProfile"),
  {
    ssr: false,
    loading: () => <div className="h-[350px] flex items-center justify-center text-white/30 text-sm">Loading chart...</div>,
  }
);

const PersonalityOrb = dynamic(
  () => import("@/components/PersonalityOrb"),
  {
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center text-white/30 text-sm">Generating orb...</div>,
  }
);

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

// Map 6-axis scores to the 12-pole OrbData format
function scoresToOrbData(scores: Record<string, number>) {
  // Each axis has two poles. Score 1-10 maps to how much of each pole.
  // High score (10) = strong "high" pole, weak "low" pole
  // Low score (1) = strong "low" pole, weak "high" pole
  const e = scores.empathy ?? 5.5;
  const s = scores.self_orientation ?? 5.5;
  const a = scores.social_attunement ?? 5.5;
  const c = scores.conscientiousness ?? 5.5;
  const ag = scores.agency ?? 5.5;
  const r = scores.reactivity ?? 5.5;

  return {
    yellow: e,                    // High Empathy
    navy: 11 - e,                 // Low Empathy (Detachment)
    chartreuse: 11 - s,           // Altruistic (low end of self-orientation)
    indigo: s,                    // Self-Focused (high end)
    lime: a,                      // Hyper-Socially Attuned
    violet: 11 - a,               // Hypo-Socially Attuned
    emerald: c,                   // Conscientious
    magenta: 11 - c,              // Impulsive/Spontaneous
    red: ag,                      // Dominant/Agentic
    teal: 11 - ag,                // Submissive/Yielding
    orange: r,                    // High Reactivity
    blue: 11 - r,                 // Low Reactivity
  };
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

  const orbData = scoresToOrbData(result.scores);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-white">Your Profile</h1>
      <p className="mt-2 text-white/50 text-sm">
        Your position across 6 personality dimensions
      </p>

      {/* Personality Orb */}
      <div className="mt-8 flex justify-center">
        <PersonalityOrb data={orbData} size={280} />
      </div>

      {/* Radar chart */}
      <div className="mt-8 rounded-xl bg-white/5 border border-white/10 p-4">
        <RadarProfile data={result.axisResults} />
      </div>

      {/* Axis detail bars */}
      <div className="mt-6 flex flex-col gap-3">
        {result.axisResults.map((ar) => (
          <div key={ar.axis} className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white/80">{ar.name}</span>
              <span className="text-sm text-white/50">{ar.score}</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-white/10">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-white/40 transition-all duration-500"
                style={{ width: `${((ar.score - 1) / 9) * 100}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-white/25">
              <span>{ar.lowLabel}</span>
              <span>{ar.highLabel}</span>
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

      <p className="mt-6 text-center text-[10px] text-white/20">
        Take the quiz multiple times in different contexts to see how your profile shifts.
        The book recommends quarterly reassessments.
      </p>
    </div>
  );
}
