"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";

const RadarProfile = dynamic(
  () => import("@/components/quiz/RadarProfile"),
  {
    ssr: false,
    loading: () => <div className="h-[350px] flex items-center justify-center text-white/40 text-sm">Loading chart...</div>,
  }
);

const PersonalityOrb = dynamic(
  () => import("@/components/PersonalityOrb"),
  {
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center text-white/40 text-sm">Generating orb...</div>,
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

interface SharedResult {
  score: number;
  label: string;
  explanation: string;
  scores: Record<string, number> | null;
  axisResults: AxisResult[] | null;
}

function ShareContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<SharedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = searchParams.get("data");
    const sig = searchParams.get("sig");

    if (!data || !sig) {
      setError("Invalid share link.");
      setLoading(false);
      return;
    }

    fetch(
      `/quiz/api/share-verify?data=${encodeURIComponent(data)}&sig=${encodeURIComponent(sig)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Invalid");
        return res.json();
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setError("This share link is invalid or has been tampered with.");
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-white/70">Loading shared result...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold text-white">Invalid Link</h1>
        <p className="mt-4 text-white/60">{error}</p>
        <a
          href="/quiz"
          className="mt-8 block w-full rounded-xl bg-white/90 px-4 py-4 text-center text-sm font-bold text-black transition-all hover:bg-white"
        >
          Take Your Own Quiz
        </a>
      </div>
    );
  }

  if (!result) return null;

  const orbData = result.scores ? scoresToOrbData(result.scores) : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">
          Shared Result
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          {result.axisResults ? "Personality Graph" : "Empathy–Detachment Spectrum"}
        </h1>
      </div>

      {orbData && (
        <div className="mt-8 flex justify-center">
          <PersonalityOrb data={orbData} size={280} />
        </div>
      )}

      {result.axisResults && (
        <div className="mt-8 rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm">
          <RadarProfile data={result.axisResults} />
        </div>
      )}

      {!result.axisResults && (
        <div className="mt-8 rounded-xl bg-white/5 border border-white/10 p-6 text-center">
          <div className="text-7xl font-bold text-white">{result.score}</div>
          <div className="mt-2 text-2xl font-bold text-white/90">
            {result.label}
          </div>
        </div>
      )}

      {result.axisResults && (
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
      )}

      <div className="mt-8 rounded-xl bg-black/30 border border-white/10 p-5 text-white/95 leading-relaxed">
        <p>{result.explanation}</p>
      </div>

      <a
        href="/quiz"
        className="mt-8 block w-full rounded-xl bg-white/90 px-4 py-4 text-center text-sm font-bold text-black transition-all hover:bg-white"
      >
        Take Your Own Quiz
      </a>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-lg text-white/70">Loading...</p>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
