"use client";

import dynamic from "next/dynamic";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";
import type { ResultData } from "./use-result";

const RadarProfile = dynamic(() => import("@/components/quiz/RadarProfile"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] flex items-center justify-center text-white/30 text-sm">Loading chart...</div>
  ),
});

const PersonalityOrb = dynamic(() => import("@/components/PersonalityOrb"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center text-white/30 text-sm">Generating orb...</div>
  ),
});

// The orb, the radar chart, and one bar per axis.
export default function ScoreDisplay({ result }: { result: ResultData }) {
  return (
    <>
      <div className="mt-8 flex justify-center">
        <PersonalityOrb data={scoresToOrbData(result.scores)} size={280} />
      </div>

      <div className="mt-8 rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm">
        <RadarProfile data={result.axisResults} />
      </div>

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
    </>
  );
}
