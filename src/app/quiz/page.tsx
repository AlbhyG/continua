"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

function QuizLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const personId = searchParams.get("person");
  const personName = searchParams.get("name");

  useEffect(() => {
    const existing = localStorage.getItem("anonymous_token");
    const token = existing || uuidv4();
    if (!existing) localStorage.setItem("anonymous_token", token);
    document.cookie = `anonymous_token=${token}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  async function startQuiz() {
    setLoading(true);
    const query = personId ? `?person=${encodeURIComponent(personId)}` : "";
    const res = await fetch(`/quiz/api/random${query}`);
    if (!res.ok) {
      const data = await res.json();
      if (data.error === "all_completed") {
        alert("All available assessments have been completed for this person.");
      } else if (data.error === "sign_in_required") {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
      setLoading(false);
      return;
    }
    const { id } = await res.json();
    const next = new URLSearchParams();
    if (personId) next.set("person", personId);
    if (personName) next.set("name", personName);
    router.push(`/quiz/take/${id}${next.size ? `?${next.toString()}` : ""}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70" />
        <p className="text-sm text-foreground/60">Preparing the assessment…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-10 px-6 pt-24 text-center">
      <div>
        {personName && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/55">
            Assessment for {personName}
          </p>
        )}
        <h1 className="text-4xl font-bold text-foreground md:text-5xl">
          Personality Assessment
        </h1>
        <p className="mt-4 text-lg text-foreground/70">
          Discover coordinates across six dimensions
        </p>
      </div>

      <div className="max-w-lg text-foreground/70">
        <p>
          This assessment maps a position across Empathy, Self-Orientation,
          Social Attunement, Conscientiousness, Agency, and Reactivity. There are
          no right or wrong positions.
        </p>
      </div>

      <button
        onClick={startQuiz}
        className="rounded-xl bg-white/90 px-8 py-4 text-lg font-bold text-foreground shadow-sm transition-all hover:bg-white"
      >
        Start Assessment
      </button>

      <p className="max-w-md text-sm text-foreground/50">
        This assessment is for self-exploration only and is not a clinical
        diagnostic tool. Signed-in results are saved to your Continua account.
      </p>
    </div>
  );
}

export default function QuizLanding() {
  return (
    <Suspense fallback={null}>
      <QuizLandingContent />
    </Suspense>
  );
}
