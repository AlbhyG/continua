"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";
import type { AxisScores } from "@/lib/quiz/scoring";

const PersonalityOrb = dynamic(() => import("@/components/PersonalityOrb"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] w-[240px] flex items-center justify-center text-foreground/30 text-sm">
      Generating orb…
    </div>
  ),
});

interface Profile {
  name: string;
  primary: string;
  tags: string;
  scores: AxisScores;
}

const AXIS_LABELS: Array<{ key: keyof AxisScores; name: string; lowLabel: string; highLabel: string }> = [
  { key: "empathy", name: "Empathy", lowLabel: "Detached", highLabel: "Highly Empathic" },
  { key: "self_orientation", name: "Self-Orientation", lowLabel: "Altruistic", highLabel: "Self-Focused" },
  { key: "social_attunement", name: "Social Attunement", lowLabel: "Hypo-Attuned", highLabel: "Hyper-Attuned" },
  { key: "conscientiousness", name: "Conscientiousness", lowLabel: "Spontaneous", highLabel: "Conscientious" },
  { key: "agency", name: "Agency", lowLabel: "Yielding", highLabel: "Agentic" },
  { key: "reactivity", name: "Reactivity", lowLabel: "Low Reactivity", highLabel: "Highly Reactive" },
];

export default function FamousFiguresExplorer({ profiles }: { profiles: Profile[] }) {
  const [selected, setSelected] = useState<Profile | null>(null);

  // Group profiles by primary category
  const categories: Record<string, Profile[]> = {};
  profiles.forEach((p) => {
    if (!categories[p.primary]) categories[p.primary] = [];
    categories[p.primary].push(p);
  });

  const categoryOrder = [
    "Narcissist",
    "Altruist",
    "Hyper-Empathic",
    "Hypo-Attuned",
    "Conscientious",
    "Impulsive",
    "Assertive",
    "Submissive",
    "High-Reactive",
    "Low-Reactive",
  ];

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {categoryOrder
          .filter((cat) => categories[cat])
          .map((cat) => (
            <div key={cat} className="glass-card p-6">
              <h2 className="text-[20px] md:text-[22px] font-bold mb-3">{cat}s</h2>
              <div className="flex flex-wrap gap-x-1 gap-y-1.5 text-[15px] md:text-[16px] leading-[1.6]">
                {categories[cat].map((p, idx) => (
                  <button
                    key={p.name}
                    onClick={() => setSelected(p)}
                    className="text-foreground/80 hover:text-foreground underline decoration-foreground/20 hover:decoration-foreground/60 underline-offset-2 transition-all cursor-pointer"
                  >
                    {p.name}
                    {idx < categories[cat].length - 1 && <span className="text-foreground/40">,</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-md w-full shadow-2xl p-6 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{selected.name}</h3>
                <p className="text-sm text-foreground/60 mt-1">{selected.tags}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-foreground/50 hover:text-foreground p-1 rounded-lg hover:bg-foreground/5 transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5L15 15M15 5L5 15" />
                </svg>
              </button>
            </div>

            {/* Orb */}
            <div className="flex justify-center my-4">
              <PersonalityOrb data={scoresToOrbData(selected.scores)} size={240} />
            </div>

            {/* Axis scores */}
            <div className="mt-4 space-y-3">
              {AXIS_LABELS.map((ax) => {
                const score = selected.scores[ax.key];
                return (
                  <div key={ax.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground/70">{ax.name}</span>
                      <span className="text-xs text-foreground/50">{score}</span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-foreground/10">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full bg-foreground/50"
                        style={{ width: `${((score - 1) / 9) * 100}%` }}
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between text-[9px] text-foreground/40">
                      <span>{ax.lowLabel}</span>
                      <span>{ax.highLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-[10px] text-center text-foreground/40 italic">
              Imputed profile based on public perception. Not an official diagnosis.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
