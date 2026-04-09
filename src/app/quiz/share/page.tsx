"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface SharedResult {
  score: number;
  label: string;
  explanation: string;
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
          Shared Result
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Empathy–Detachment Spectrum
        </h1>
      </div>

      <div className="mt-8 rounded-xl bg-white/5 border border-white/10 p-6 text-center">
        <div className="text-7xl font-bold text-white">{result.score}</div>
        <div className="mt-2 text-2xl font-bold text-white/90">
          {result.label}
        </div>
      </div>

      <div className="mt-8 text-white/60 leading-relaxed">
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
