"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import LocalDateTime from "@/components/LocalDateTime";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";
import type { AxisScores } from "@/lib/quiz/scoring";

// The orb draws live with WebGL. Phones only allow a few of those at once,
// so on narrow screens this shows a single orb (the latest assessment). On a
// laptop-width screen it also shows the one before it, side by side.
const PersonalityOrb = dynamic(() => import("@/components/PersonalityOrb"), {
  ssr: false,
  loading: () => <div className="h-[200px] w-[200px]" aria-hidden="true" />,
});

type Orb = { resultId: number; scores: Partial<AxisScores>; takenAt: string };

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

function OrbCard({ orb, label }: { orb: Orb; label: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <PersonalityOrb data={scoresToOrbData(orb.scores)} size={200} />
      {label && <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/55">{label}</p>}
      <p className="text-sm text-foreground/60">
        <LocalDateTime iso={orb.takenAt} className="font-semibold text-foreground/75" />
      </p>
      <Link
        href={`/quiz/results/${orb.resultId}`}
        className="mt-1 inline-block rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-white"
      >
        See full results
      </Link>
    </div>
  );
}

export default function LatestOrbs({ orbs }: { orbs: Orb[] }) {
  const wide = useWide();
  const shown = wide ? orbs.slice(0, 2) : orbs.slice(0, 1);
  if (shown.length === 0) return null;
  const two = shown.length === 2;

  return (
    <section className="glass-card mt-8 p-6">
      <h2 className="text-center text-2xl font-bold">{two ? "Your latest orbs" : "Your latest orb"}</h2>
      <div className={`mt-5 grid gap-8 ${two ? "grid-cols-2" : "grid-cols-1"}`}>
        {shown.map((orb, i) => (
          <OrbCard key={orb.resultId} orb={orb} label={two ? (i === 0 ? "Latest" : "Previous") : null} />
        ))}
      </div>
      <p className="mx-auto mt-5 max-w-md text-center text-sm text-foreground/70">
        Each color is one pole of a coordinate. The stronger you lean toward a pole, the more of its color shows.
      </p>
    </section>
  );
}
