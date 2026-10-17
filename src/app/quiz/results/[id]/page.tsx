"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";
import AssessmentLimitations from "@/components/AssessmentLimitations";

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
  shareLink: string | null;
  personId?: string | null;
  personName?: string | null;
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id;

  const [result, setResult] = useState<ResultData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<"not_found" | "unavailable" | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${resultId}`);
    if (stored) {
      setResult(JSON.parse(stored));
      return;
    }
    fetch(`/quiz/api/results/${resultId}`)
      .then((res) => {
        if (res.status === 403 || res.status === 404) {
          // Stale or inaccessible result: stop the header from pointing at it again.
          if (localStorage.getItem("latest_result_id") === String(resultId)) {
            localStorage.removeItem("latest_result_id");
            window.dispatchEvent(new Event("continua:latest-result"));
          }
          setLoadError("not_found");
          return null;
        }
        if (!res.ok) {
          setLoadError("unavailable");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setResult(data);
      })
      .catch(() => setLoadError("unavailable"));
  }, [resultId]);

  async function takeAnother() {
    const personQuery = result?.personId
      ? `?person=${encodeURIComponent(result.personId)}`
      : "";
    const res = await fetch(`/quiz/api/random${personQuery}`);
    if (!res.ok) {
      const data = await res.json();
      if (data.error === "all_completed") {
        alert("You've completed all available questionnaires!");
        return;
      }
      return;
    }
    const { id } = await res.json();
    const next = new URLSearchParams();
    if (result?.personId) next.set("person", result.personId);
    if (result?.personName) next.set("name", result.personName);
    router.push(`/quiz/take/${id}${next.size ? `?${next.toString()}` : ""}`);
  }

  function copyShareLink() {
    if (!result || !result.shareLink) return;
    const url = window.location.origin + result.shareLink;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!result && loadError) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-foreground">
          {loadError === "not_found"
            ? "We couldn't find this result."
            : "Results are temporarily unavailable."}
        </p>
        <p className="text-sm text-foreground/60">
          {loadError === "not_found"
            ? "Results are tied to the browser or account you used to take the assessment. If you took it in a different browser or before signing in, it won't show up here."
            : "Please try again in a few minutes."}
        </p>
        <Link
          href="/quiz"
          className="mt-2 rounded-xl bg-white/90 px-6 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-white"
        >
          Take the Assessment
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-foreground/70">Loading result...</p>
      </div>
    );
  }

  const orbData = scoresToOrbData(result.scores);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-foreground">Your Personality Graph</h1>
      {result.personName && (
        <p className="mt-1 text-sm font-semibold text-foreground/70">
          Assessment for {result.personName}
        </p>
      )}
      <p className="mt-2 text-foreground/60 text-sm">
        Your coordinates across 6 personality dimensions
      </p>

      {/* Personality Orb */}
      <div className="mt-6"><AssessmentLimitations /></div>
      <div className="mt-8 flex justify-center">
        <PersonalityOrb data={orbData} size={280} />
      </div>

      {/* Radar chart */}
      <div className="mt-8 rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm">
        <RadarProfile data={result.axisResults} />
      </div>

      {/* Axis detail bars */}
      <div className="mt-6 flex flex-col gap-3">
        {result.axisResults.map((ar) => (
          <div key={ar.axis} className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-foreground/80">{ar.name}</span>
              <span className="text-sm text-foreground/50">{ar.score}</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-foreground/10">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-foreground/40 transition-all duration-500"
                style={{ width: `${((ar.score - 1) / 9) * 100}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-foreground/40">
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
          className="w-full rounded-xl bg-white/90 px-4 py-4 text-sm font-bold text-foreground transition-all hover:bg-white shadow-sm"
        >
          Take Another Assessment
        </button>
        {result.shareLink && (
          <button
            onClick={copyShareLink}
            className="w-full rounded-xl bg-white/40 px-4 py-4 text-sm font-bold text-foreground transition-all hover:bg-white/60"
          >
            {copied ? "Link Copied!" : "Share Result"}
          </button>
        )}
        <Link
          href="/famous-figures"
          className="w-full rounded-xl bg-white/40 px-4 py-4 text-center text-sm font-bold text-foreground transition-all hover:bg-white/60"
        >
          Famous Archetypal Figures
        </Link>
      </div>

      <p className="mt-6 text-center text-[10px] text-foreground/40">
        Take the assessment in different contexts to see how your coordinates shift.
        The book recommends quarterly reassessments.
      </p>
    </div>
  );
}
