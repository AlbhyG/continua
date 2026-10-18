"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";
import type { AxisScores } from "@/lib/quiz/scoring";
import { FAMOUS_FIGURE_CATEGORIES } from "@/lib/famous-figures";

const PersonalityOrb = dynamic(() => import("@/components/PersonalityOrb"), {
  ssr: false,
  loading: () => null,
});

export interface CompareEntry {
  id: string;
  name: string;
  note: string;
  scores: AxisScores;
  isMe: boolean;
  group?: string;
}

const MAX = 3;

// One marker style per slot: color plus shape, so the comparison still reads
// without relying on color alone.
const SLOTS = [
  { color: "#1f2937", shape: "circle" },
  { color: "#b45309", shape: "square" },
  { color: "#6d28d9", shape: "diamond" },
] as const;

const AXES: Array<{ key: keyof AxisScores; name: string; lowLabel: string; highLabel: string }> = [
  { key: "social_attunement", name: "Social Attunement", lowLabel: "Hypo-Attuned", highLabel: "Hyper-Attuned" },
  { key: "empathy", name: "Empathy", lowLabel: "Detached", highLabel: "Empathetic" },
  { key: "self_orientation", name: "Self-Orientation", lowLabel: "Altruistic", highLabel: "Self-Oriented" },
  { key: "conscientiousness", name: "Conscientiousness", lowLabel: "Spontaneous", highLabel: "Disciplined" },
  { key: "agency", name: "Agency", lowLabel: "Accommodating", highLabel: "Agentic" },
  { key: "reactivity", name: "Reactivity", lowLabel: "Calm", highLabel: "Highly Reactive" },
];

// Orb sized to its card so three fit on a phone; data memoized so the
// WebGL orb isn't rebuilt on every render.
function OrbCell({ scores }: { scores: AxisScores }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const data = useMemo(() => scoresToOrbData(scores), [scores]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize(Math.round(Math.min(el.clientWidth, 220)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="flex w-full justify-center" style={{ minHeight: size || 100 }}>
      {size > 0 && <PersonalityOrb data={data} size={size} />}
    </div>
  );
}

function Marker({ slot, size = 14 }: { slot: number; size?: number }) {
  const { color, shape } = SLOTS[slot];
  const h = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      {shape === "circle" && <circle cx={h} cy={h} r={h - 1} fill={color} stroke="white" strokeWidth={1.5} />}
      {shape === "square" && (
        <rect x={1.5} y={1.5} width={size - 3} height={size - 3} rx={1.5} fill={color} stroke="white" strokeWidth={1.5} />
      )}
      {shape === "diamond" && (
        <polygon points={`${h},0.8 ${size - 0.8},${h} ${h},${size - 0.8} 0.8,${h}`} fill={color} stroke="white" strokeWidth={1.5} />
      )}
    </svg>
  );
}

export default function CompareExplorer({
  figures,
  me,
  initial,
}: {
  figures: CompareEntry[];
  me: CompareEntry | null;
  initial: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const all = useMemo(() => (me ? [me, ...figures] : figures), [me, figures]);
  const byId = useMemo(() => new Map(all.map((e) => [e.id, e])), [all]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const fromUrl = initial.filter((id) => byId.has(id)).slice(0, MAX);
    if (fromUrl.length > 0) return fromUrl;
    return me ? ["me"] : [];
  });
  const [query, setQuery] = useState("");
  const orbsRef = useRef<HTMLDivElement>(null);
  const [scrollPending, setScrollPending] = useState(false);

  // After a pick, bring the orbs into view (once they've rendered).
  useEffect(() => {
    if (!scrollPending) return;
    setScrollPending(false);
    orbsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollPending, selectedIds]);

  // Keep the URL in step so a comparison can be bookmarked or shared.
  useEffect(() => {
    const qs = selectedIds.length ? `?p=${selectedIds.map(encodeURIComponent).join(",")}` : "";
    router.replace(`${pathname}${qs}`, { scroll: false });
  }, [selectedIds, pathname, router]);

  const selected = selectedIds.map((id) => byId.get(id)).filter((e): e is CompareEntry => !!e);
  const full = selected.length >= MAX;

  const q = query.trim().toLowerCase();
  const matches = q
    ? all.filter((e) => !selectedIds.includes(e.id) && e.name.toLowerCase().includes(q)).slice(0, 8)
    : [];

  // Shift-click keeps you where you are, for picking several in a row.
  function add(id: string, stay = false) {
    if (full || selectedIds.includes(id)) return;
    setSelectedIds((ids) => [...ids, id]);
    setQuery("");
    if (!stay) setScrollPending(true);
  }

  function remove(id: string) {
    setSelectedIds((ids) => ids.filter((x) => x !== id));
  }

  const hasFigure = selected.some((e) => !e.isMe);

  const groups = FAMOUS_FIGURE_CATEGORIES.map(({ key, title }) => ({
    title,
    people: figures.filter((f) => f.group === key),
  })).filter((g) => g.people.length > 0);

  return (
    <>
      {/* Picker */}
      <div className="glass-card p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {selected.map((e, slot) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-3 pr-1.5 text-[15px] font-semibold text-foreground shadow-sm"
            >
              <Marker slot={slot} />
              {e.name}
              <button
                onClick={() => remove(e.id)}
                className="rounded-full p-1 text-foreground/50 hover:bg-foreground/10 hover:text-foreground"
                aria-label={`Remove ${e.name}`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 3L9 9M9 3L3 9" />
                </svg>
              </button>
            </span>
          ))}
          {me && !selectedIds.includes("me") && !full && (
            <button
              onClick={() => add("me")}
              className="rounded-full border border-dashed border-foreground/30 px-3 py-1.5 text-[15px] font-semibold text-foreground/70 hover:border-foreground/60 hover:text-foreground"
            >
              + Me
            </button>
          )}
        </div>

        <div className="relative mt-4">
          <label htmlFor="compare-search" className="sr-only">
            Add a person
          </label>
          <input
            id="compare-search"
            type="text"
            value={query}
            disabled={full}
            onChange={(ev) => setQuery(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" && matches[0]) add(matches[0].id);
            }}
            placeholder={full ? `Up to ${MAX} at a time — remove one to add another` : "Type a name, e.g. Gandhi"}
            autoComplete="off"
            className="w-full rounded-xl border border-foreground/15 bg-white/90 px-4 py-3 text-[16px] text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none disabled:opacity-60"
          />
          {matches.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-foreground/10 bg-white shadow-xl">
              {matches.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => add(e.id)}
                    className="flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left hover:bg-foreground/5"
                  >
                    <span className="text-[15px] font-semibold text-foreground">{e.name}</span>
                    <span className="truncate text-xs text-foreground/50">{e.note}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {q && matches.length === 0 && (
            <p className="mt-2 text-sm text-foreground/60">
              No one by that name yet.{" "}
              <a href="#everyone" className="underline underline-offset-2 hover:text-foreground">
                See who&rsquo;s available
              </a>
              .
            </p>
          )}
        </div>
        {!q && (
          <p className="mt-2 text-sm text-foreground/60">
            Choose from {figures.length} famous figures.{" "}
            <a href="#everyone" className="font-semibold underline underline-offset-2 hover:text-foreground">
              See the full list ↓
            </a>
          </p>
        )}
      </div>

      {selected.length === 0 ? (
        <p className="mt-8 text-center text-white/70">Add someone above to begin.</p>
      ) : (
        <>
          {/* Orbs side by side */}
          <div
            ref={orbsRef}
            className={`mt-6 scroll-mt-24 grid gap-2 md:gap-4 ${
              selected.length === 1 ? "grid-cols-1 max-w-[320px] mx-auto" : selected.length === 2 ? "grid-cols-2" : "grid-cols-3"
            }`}
          >
            {selected.map((e, slot) => (
              <div key={e.id} className="glass-card flex min-w-0 flex-col items-center p-3 md:p-5">
                <div className="flex w-full items-center justify-center gap-1.5 text-center">
                  <Marker slot={slot} />
                  <h2 className="text-[14px] leading-tight md:text-[19px] font-bold text-foreground">{e.name}</h2>
                </div>
                <p className="mt-0.5 hidden md:block h-4 max-w-full truncate text-xs text-foreground/50">{e.note}</p>
                <div className="mt-3 w-full">
                  <OrbCell scores={e.scores} />
                </div>
              </div>
            ))}
          </div>

          {/* Axis by axis */}
          <div className="glass-card mt-6 p-5 md:p-6">
            <h2 className="text-[20px] md:text-[22px] font-bold text-foreground">Axis by axis</h2>
            <div className="mt-5 space-y-6">
              {AXES.map((ax) => (
                <div key={ax.key}>
                  <div className="mb-2 text-sm font-bold text-foreground/75">{ax.name}</div>
                  <div className="relative h-5">
                    <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-foreground/10" />
                    <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-foreground/20" />
                    {selected.map((e, slot) => {
                      const score = e.scores[ax.key];
                      // Spread markers that land on the same score so none is hidden.
                      const twins = selected.filter((o) => o.scores[ax.key] === score);
                      const nudge = (twins.indexOf(e) - (twins.length - 1) / 2) * 9;
                      return (
                        <div
                          key={e.id}
                          className="absolute top-1/2"
                          style={{
                            left: `calc(${((score - 1) / 9) * 100}% + ${nudge}px)`,
                            transform: "translate(-50%, -50%)",
                          }}
                          title={`${e.name}: ${score}`}
                        >
                          <Marker slot={slot} size={16} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-foreground/50">
                    <span>{ax.lowLabel}</span>
                    <span>{ax.highLabel}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Exact numbers */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-foreground/60">
                    <th className="py-2 pr-3 font-semibold">Axis (1–10)</th>
                    {selected.map((e, slot) => (
                      <th key={e.id} className="px-2 py-2 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Marker slot={slot} size={11} />
                          <span className="truncate">{e.name}</span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AXES.map((ax) => (
                    <tr key={ax.key} className="border-b border-foreground/5 last:border-0">
                      <td className="py-2 pr-3 text-foreground/75">{ax.name}</td>
                      {selected.map((e) => (
                        <td key={e.id} className="px-2 py-2 font-semibold tabular-nums text-foreground">
                          {Number.isInteger(e.scores[ax.key]) ? e.scores[ax.key] : e.scores[ax.key].toFixed(1)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {hasFigure && (
            <p className="mt-4 text-center text-xs italic text-white/60">
              Famous figures&rsquo; profiles are imputed from public perception, not official diagnoses.
            </p>
          )}
        </>
      )}
      {/* Everyone available, grouped as on the Famous Figures page */}
      <div id="everyone" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] md:text-[26px] font-bold text-white">Who you can compare</h2>
        <p className="mt-1 text-[15px] text-white/70">
          {full ? "Remove someone above to add another." : "Click a name to add it."}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="glass-card p-5">
              <h3 className="mb-2 text-[17px] md:text-[19px] font-bold text-foreground">{g.title}</h3>
              <div className="flex flex-wrap gap-x-1 gap-y-1.5 text-[15px] leading-[1.6]">
                {g.people.map((f, i) => {
                  const slot = selectedIds.indexOf(f.id);
                  const isSel = slot >= 0;
                  return (
                    <button
                      key={f.id}
                      onClick={(ev) => (isSel ? remove(f.id) : add(f.id, ev.shiftKey))}
                      disabled={!isSel && full}
                      aria-pressed={isSel}
                      className={`inline-flex items-center gap-1 transition-colors ${
                        isSel
                          ? "font-semibold text-foreground"
                          : "text-foreground/80 underline decoration-foreground/20 underline-offset-2 hover:text-foreground hover:decoration-foreground/60 disabled:cursor-not-allowed disabled:no-underline disabled:text-foreground/40"
                      }`}
                    >
                      {isSel && <Marker slot={slot} size={11} />}
                      {f.name}
                      {i < g.people.length - 1 && <span className="text-foreground/40">,</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
