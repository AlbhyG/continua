"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AssessmentLimitations from "@/components/AssessmentLimitations";
import { SHOW_PEOPLE_COMPARISON } from "@/lib/site-mode";
import DeleteResult from "./delete-result";
import { ComparisonInviteNotice, SignInToKeepNotice } from "./result-notices";
import ScoreDisplay from "./score-display";
import { ShareButton, StopSharing, useSharing } from "./share-controls";
import { useResult, type ResultData } from "./use-result";

const secondaryButtonClass =
  "w-full rounded-xl bg-white/40 px-4 py-4 text-center text-sm font-bold text-foreground transition-all hover:bg-white/60";

export default function QuizResultsPage() {
  const resultId = String(useParams().id);
  const { result, loadError } = useResult(resultId);

  if (!result && loadError) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-foreground">
          {loadError === "not_found" ? "We couldn't find this result." : "Results are temporarily unavailable."}
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

  return <ResultView resultId={resultId} result={result} />;
}

function ResultView({ resultId, result }: { resultId: string; result: ResultData }) {
  const router = useRouter();
  const sharing = useSharing(resultId, result.activeShareCount ?? 0);
  const canShare = result.canShare !== false;

  async function takeAnother() {
    const res = await fetch("/quiz/api/random");
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.error === "all_completed") alert("You've completed all available questionnaires!");
      return;
    }
    const { id } = await res.json();
    router.push(`/quiz/take/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-foreground">Your Personality Graph</h1>
      {result.personName && (
        <p className="mt-1 text-sm font-semibold text-foreground/70">Assessment for {result.personName}</p>
      )}
      <p className="mt-2 text-foreground/60 text-sm">Your coordinates across 6 personality dimensions</p>

      <div className="mt-6">
        <AssessmentLimitations />
      </div>
      <ScoreDisplay result={result} />

      <ComparisonInviteNotice result={result} />
      <SignInToKeepNotice result={result} resultId={resultId} />

      {/* Order: Take, Share, (Compare), Famous Figures, Stop sharing, then Delete. */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={takeAnother}
          className="w-full rounded-xl bg-white/90 px-4 py-4 text-sm font-bold text-foreground transition-all hover:bg-white shadow-sm"
        >
          Take another assessment
        </button>
        {(result.earlierCount ?? 0) > 0 && (
          <Link href="/my-info#trends" className={secondaryButtonClass}>
            {result.earlierCount === 1
              ? "Compare with your earlier assessment"
              : `Compare with your ${result.earlierCount} earlier assessments`}
          </Link>
        )}
        {canShare && <ShareButton sharing={sharing} />}
        {SHOW_PEOPLE_COMPARISON && (
          <Link href="/compare/people" className={secondaryButtonClass}>
            Compare with someone
          </Link>
        )}
        <Link href="/famous-figures" className={secondaryButtonClass}>
          Famous Archetypal Figures
        </Link>
        {canShare && <StopSharing sharing={sharing} />}
      </div>

      <DeleteResult resultId={resultId} activeShares={sharing.activeShares} />

      <p className="mt-6 text-center text-[10px] text-foreground/40">
        Take the assessment in different contexts to see how your coordinates shift.
      </p>
    </div>
  );
}
