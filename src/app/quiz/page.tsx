"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function QuizLanding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("anonymous_token")) {
      const token = uuidv4();
      localStorage.setItem("anonymous_token", token);
      document.cookie = `anonymous_token=${token}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      const token = localStorage.getItem("anonymous_token")!;
      document.cookie = `anonymous_token=${token}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  async function startQuiz() {
    setLoading(true);
    const res = await fetch("/quiz/api/random");
    if (!res.ok) {
      const data = await res.json();
      if (data.error === "all_completed") {
        alert("You've completed all available assessments!");
        setLoading(false);
        return;
      }
      setLoading(false);
      return;
    }
    const { id } = await res.json();
    router.push(`/quiz/take/${id}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70" />
        <p className="text-foreground/60 text-sm">Preparing your assessment...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-12 px-6 pt-24 text-center">
      <div>
        <h1 className="text-4xl font-bold text-foreground md:text-5xl">
          Personality Assessment
        </h1>
        <p className="mt-4 text-lg text-foreground/70">
          Discover your coordinates across six dimensions
        </p>
      </div>

      <div className="max-w-lg text-foreground/70">
        <p>
          This assessment maps your position across six personality dimensions —
          Empathy, Self-Orientation, Social Attunement, Conscientiousness,
          Agency, and Reactivity. There are no right or wrong positions. Each
          axis represents a continuum where both poles serve essential human
          functions.
        </p>
      </div>

      <button
        onClick={startQuiz}
        className="rounded-xl bg-white/90 px-8 py-4 text-lg font-bold text-foreground transition-all hover:bg-white shadow-sm"
      >
        Start Assessment
      </button>

      <p className="max-w-md text-sm text-foreground/50">
        This assessment is for self-exploration only and is not a clinical
        diagnostic tool. Your responses are stored anonymously.
      </p>
    </div>
  );
}
