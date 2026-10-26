import { AXIS_INFO } from "@/lib/quiz/scoring";
import { RELATIONSHIP_LABEL, type AxisView, type NamedRater } from "@/lib/observer/view";

// One row per axis on the 1 to 10 track: the person's own rating (teal),
// each named rater (amber, with an initial), the anonymous average (grey
// diamond), and, once two or more people's answers are shown, a shaded band
// covering their range. Same
// colors as the comparison chart, and nothing that implies a better end.
export const COLOR_SELF = "#1d7f6a";
export const COLOR_NAMED = "#b8730a";
export const COLOR_ANON = "#5b6472";

const pct = (v: number) => ((v - 1) / 9) * 100;

export function raterInitials(named: NamedRater[]): Record<string, string> {
  const counts: Record<string, number> = {};
  const out: Record<string, string> = {};
  for (const r of named) {
    const base = (r.name.trim()[0] ?? "?").toUpperCase();
    counts[base] = (counts[base] ?? 0) + 1;
    out[r.id] = counts[base] > 1 ? `${base}${counts[base]}` : base;
  }
  return out;
}

export default function ObserverChart({ axes, named }: { axes: AxisView[]; named: NamedRater[] }) {
  const initials = raterInitials(named);
  const nameOf = Object.fromEntries(named.map((r) => [r.id, r.name]));
  return (
    <div>
      {axes.map((a) => {
        const info = AXIS_INFO[a.axis];
        const label = [
          `${info.name}.`,
          a.self !== null ? `You: ${a.self}.` : "",
          ...a.named.map((n) => `${nameOf[n.id]}: ${n.value}.`),
          a.anonymousAverage !== null ? `Anonymous average: ${a.anonymousAverage}.` : "",
          a.low !== null && a.high !== null ? `Others range from ${a.low} to ${a.high}.` : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={a.axis} className="border-t border-foreground/10 py-3 first:border-t-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold">{info.name}</span>
              {a.cantTellShare >= 0.25 && (
                <span className="text-xs text-foreground/55">
                  {Math.round(a.cantTellShare * 100)}% &ldquo;Can&apos;t tell&rdquo;
                </span>
              )}
            </div>
            <div className="relative mt-2 h-9" role="img" aria-label={label}>
              <div className="absolute inset-x-3.5 top-1/2 h-0.5 -translate-y-1/2 bg-foreground/15" />
              <div className="absolute inset-y-0 inset-x-3.5">
                {a.count >= 2 && a.low !== null && a.high !== null && (
                  <i
                    className="absolute top-[4px] bottom-[4px] rounded-md bg-[#b8730a]/15 ring-1 ring-[#b8730a]/30"
                    style={{ left: `${pct(a.low)}%`, width: `${Math.max(pct(a.high) - pct(a.low), 0.8)}%` }}
                  />
                )}
                {a.anonymousAverage !== null && (
                  <b
                    title={`Anonymous average ${a.anonymousAverage}`}
                    className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-white"
                    style={{ left: `${pct(a.anonymousAverage)}%`, background: COLOR_ANON }}
                  />
                )}
                {a.named.map((n) => (
                  <b
                    key={n.id}
                    title={`${nameOf[n.id]} ${n.value}`}
                    className="absolute top-1/2 grid h-[24px] min-w-[24px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white px-1 text-[11px] font-semibold text-white"
                    style={{ left: `${pct(n.value)}%`, background: COLOR_NAMED }}
                  >
                    {initials[n.id]}
                  </b>
                ))}
                {a.self !== null && (
                  <b
                    title={`You ${a.self}`}
                    className="absolute top-1/2 grid h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow"
                    style={{ left: `${pct(a.self)}%`, background: COLOR_SELF }}
                  >
                    You
                  </b>
                )}
              </div>
            </div>
            <div className="flex justify-between px-0.5 text-[11px] text-foreground/50">
              <span>{info.lowLabel}</span>
              <span>{info.highLabel}</span>
            </div>
            <p className="mt-1 text-xs tabular-nums text-foreground/70">
              {a.self !== null && (
                <span className="mr-3 font-semibold" style={{ color: COLOR_SELF }}>
                  You {a.self}
                </span>
              )}
              {a.othersAverage !== null ? (
                <span className="font-semibold" style={{ color: COLOR_NAMED }}>
                  {a.count === 1 ? "Them" : `Others' average`} {a.othersAverage}
                  {a.count > 1 && a.low !== null && a.high !== null && (
                    <span className="font-normal text-foreground/60">
                      {" "}
                      (range {a.low} to {a.high})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-foreground/50">Not enough answers to score this axis</span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function ChartLegend({
  named,
  anonymousShown,
  showRange,
}: {
  named: NamedRater[];
  anonymousShown: number;
  /** Only when at least two people's answers are shown, so there is a range. */
  showRange: boolean;
}) {
  const initials = raterInitials(named);
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-foreground/75">
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-3.5 w-3.5 rounded-full" style={{ background: COLOR_SELF }} /> You
      </li>
      {named.map((r) => (
        <li key={r.id} className="flex items-center gap-1.5">
          <span
            className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-0.5 text-[10px] font-semibold text-white"
            style={{ background: COLOR_NAMED }}
          >
            {initials[r.id]}
          </span>
          {r.name}
          {r.relationship && <span className="text-foreground/50">({RELATIONSHIP_LABEL[r.relationship]})</span>}
        </li>
      ))}
      {anonymousShown > 0 && (
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rotate-45" style={{ background: COLOR_ANON }} /> Anonymous average (
          {anonymousShown} people)
        </li>
      )}
      {showRange && (
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm bg-[#b8730a]/15 ring-1 ring-[#b8730a]/30" /> Range of how
          others see you
        </li>
      )}
    </ul>
  );
}
