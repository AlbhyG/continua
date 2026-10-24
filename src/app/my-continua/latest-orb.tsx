"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import LocalDateTime from "@/components/LocalDateTime";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";
import type { AxisScores } from "@/lib/quiz/scoring";

// The orb draws live with WebGL. Phones only allow a few of those at once,
// so this page shows a single orb, for the latest assessment, rather than
// one per history card.
const PersonalityOrb = dynamic(() => import("@/components/PersonalityOrb"), {
  ssr: false,
  loading: () => <div className="h-[220px] w-[220px]" aria-hidden="true" />,
});

export default function LatestOrb({
  resultId,
  scores,
  takenAt,
}: {
  resultId: number;
  scores: Partial<AxisScores>;
  takenAt: string;
}) {
  return (
    <section className="glass-card mt-8 flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-8">
      <PersonalityOrb data={scoresToOrbData(scores)} size={220} />
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold">Your latest orb</h2>
        <p className="mt-1 text-sm text-foreground/60">
          From your assessment on{" "}
          <LocalDateTime iso={takenAt} className="font-semibold text-foreground/75" />
        </p>
        <p className="mt-3 max-w-sm text-sm text-foreground/70">
          Each color is one pole of a coordinate. The stronger you lean toward a pole,
          the more of its color shows.
        </p>
        <Link
          href={`/quiz/results/${resultId}`}
          className="mt-4 inline-block rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-white"
        >
          See full results
        </Link>
      </div>
    </section>
  );
}
