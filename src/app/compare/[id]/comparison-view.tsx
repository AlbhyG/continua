"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AssessmentLimitations from "@/components/AssessmentLimitations";
import DumbbellChart, { COLOR_ME, COLOR_OTHER } from "@/components/compare/DumbbellChart";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";
import { AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import { ALIGNED_MAX_GAP, type Comparison } from "@/lib/comparison/compare";
import { adviceFor, axisIntro } from "@/lib/comparison/advice";

const PersonalityOrb = dynamic(() => import("@/components/PersonalityOrb"), {
  ssr: false,
  loading: () => <div className="h-[120px]" />,
});

type Person = { name: string; scores: AxisScores; takenAt: string };
type View =
  | { state: "active"; me: Person; other: Person; comparison: Comparison }
  | { state: "pending" | "declined" | "revoked" | "unavailable" };

const MESSAGES: Record<string, string> = {
  pending: "This comparison is waiting for the other person to accept. Nothing is shown until they do.",
  declined: "This invitation was declined.",
  revoked: "This comparison was ended, and it is no longer available to either person.",
  unavailable:
    "This comparison can't be shown right now. One of the two assessments it uses is no longer available.",
};

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));

export default function ComparisonView({ id }: { id: string }) {
  const [view, setView] = useState<View | null>(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch(`/compare/api/comparisons/${id}`, { cache: "no-store" })
      .then((res) => {
        if (res.status === 404) {
          setMissing(true);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => data && setView(data))
      .catch(() => setMissing(true));
  }, [id]);
  useEffect(load, [load]);

  async function endComparison() {
    if (busy) return;
    if (!window.confirm("End this comparison? It disappears for both of you right away.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/compare/api/comparisons/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <Link href="/compare" className="text-sm font-semibold text-white/75 underline underline-offset-2">
        ← Compare
      </Link>

      {missing && (
        <div className="glass-card mt-8 p-6">
          <h1 className="text-2xl font-bold">Comparison not found</h1>
          <p className="mt-2 text-foreground/70">It may have been ended, or the link may not be yours.</p>
        </div>
      )}

      {!missing && !view && <p className="mt-10 text-white/70">Loading comparison…</p>}

      {view && view.state !== "active" && (
        <div className="glass-card mt-8 p-6">
          <h1 className="text-2xl font-bold">Comparison</h1>
          <p className="mt-2 text-foreground/70">{MESSAGES[view.state]}</p>
        </div>
      )}

      {view && view.state === "active" && <Active view={view} onEnd={endComparison} busy={busy} />}
    </main>
  );
}

function Active({
  view,
  onEnd,
  busy,
}: {
  view: Extract<View, { state: "active" }>;
  onEnd: () => void;
  busy: boolean;
}) {
  const { me, other, comparison } = view;
  const nameOf = (side: "a" | "b") => (side === "a" ? me.name : other.name);
  const largest = comparison.largestGap;
  const close = largest.gap < ALIGNED_MAX_GAP;

  return (
    <>
      <h1 className="mt-6 text-4xl font-bold text-white">
        {me.name} and {other.name}
      </h1>
      <p className="mt-2 text-sm text-white/70">
        Based on assessments taken {fmt(me.takenAt)} ({me.name}) and {fmt(other.takenAt)} ({other.name}).
      </p>

      <section className="glass-card mt-6 grid grid-cols-2 gap-4 p-5">
        {[
          { p: me, color: COLOR_ME },
          { p: other, color: COLOR_OTHER },
        ].map(({ p, color }) => (
          <div key={p.name} className="text-center">
            <PersonalityOrb data={scoresToOrbData(p.scores)} size={130} />
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: color }} />
              {p.name}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-6">
        <AssessmentLimitations />
        <p className="mt-3 rounded-xl bg-white/70 p-4 text-sm leading-relaxed text-foreground">
          This is not an assessment of relationship health or compatibility, and it is not a substitute for
          counseling or other professional relationship support. It describes each person&apos;s self-reported
          tendencies, not facts about the relationship or evidence about either person&apos;s character.
        </p>
      </div>

      <p className="mt-6 text-lg text-white">
        {close ? (
          <>The two profiles are close on every axis.</>
        ) : (
          <>
            Largest gap: <b>{AXIS_INFO[largest.axis].name}</b> ({largest.gap} points). The chart order is fixed
            and does not change.
          </>
        )}
      </p>

      <section className="glass-card mt-4 p-5">
        <DumbbellChart axes={comparison.axes} names={{ a: me.name, b: other.name }} />
      </section>

      <h2 className="mt-8 text-xl font-bold text-white">What each axis looks like together</h2>
      <section className="glass-card mt-3 divide-y divide-foreground/10 px-5">
        {comparison.axes.map((axis) => {
          const higher = axis.higher ?? "a";
          const text = adviceFor(axis.axis, axis.shape, {
            a: me.name,
            b: other.name,
            higher: nameOf(higher),
            lower: nameOf(higher === "a" ? "b" : "a"),
          });
          const intro = axisIntro(axis.axis);
          return (
            <div key={axis.axis} className="py-4">
              <div className="flex items-center gap-2">
                <b>{AXIS_INFO[axis.axis].name}</b>
                <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-[11px] font-semibold text-foreground/60">
                  {axis.shape === "divergent" ? "Divergent" : "Aligned"}
                </span>
              </div>
              {text ? (
                <>
                  {intro && <p className="mt-1 text-xs text-foreground/55">{intro}</p>}
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{text}</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-foreground/50">Description for this axis is coming soon.</p>
              )}
            </div>
          );
        })}
      </section>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onEnd}
          disabled={busy}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-white underline underline-offset-4 disabled:opacity-50"
        >
          End this comparison
        </button>
      </div>
    </>
  );
}
