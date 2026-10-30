import { AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import { COLOR_ME } from "@/components/compare/DumbbellChart";

export type Source = { key: string; label: string; short: string; color: string; scores: Record<string, number | null> };
export type AxisRow = {
  axis: keyof AxisScores;
  self: number | null;
  others: number | null;
  low: number | null;
  high: number | null;
  points: number;
  agree: boolean | null;
};

export const RATER_COLORS = ["#b8730a", "#6b4fa0", "#2b6cb0", "#b83261", "#5f6f12", "#8a5a2b"];
export const ANON_COLOR = "#555555";

const pct = (v: number) => ((v - 1) / 9) * 100;
const CLOSE_PCT = 7;

// Raters see behavior, not inner experience. On these two axes, that matters most.
const EXPRESSION_NOTE: Partial<Record<keyof AxisScores, string>> = {
  empathy: "Others can see how your care shows, not how much you feel it.",
  reactivity: "Others can see how strongly your feelings show, not how strongly you feel them.",
};

// One row per axis: your own score and each source on a 1 to 10 track. Dots
// that would overlap are nudged up or down so every one stays visible.
export default function OthersChart({
  rows,
  sources,
}: {
  rows: AxisRow[];
  sources: Source[];
}) {
  return (
    <div>
      {rows.map((row) => {
        const info = AXIS_INFO[row.axis];
        const dots = [
          ...(row.self !== null ? [{ key: "me", short: "Me", color: COLOR_ME, v: row.self, label: "You" }] : []),
          ...sources
            .filter((s) => typeof s.scores[row.axis] === "number")
            .map((s) => ({ key: s.key, short: s.short, color: s.color, v: s.scores[row.axis] as number, label: s.label })),
        ].sort((a, b) => a.v - b.v);
        let lastPct = -100;
        let flip = 1;
        const placed = dots.map((d) => {
          const p = pct(d.v);
          let dy = 0;
          if (p - lastPct < CLOSE_PCT) {
            dy = 9 * flip;
            flip = -flip;
          } else {
            flip = 1;
          }
          lastPct = p;
          return { ...d, p, dy };
        });
        return (
          <div key={row.axis} className="border-t border-foreground/10 py-4 first:border-t-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold">{info.name}</span>
              {row.agree !== null && (
                <span className="text-xs text-foreground/60">
                  {row.agree ? "Your raters largely agree" : "Your raters see you differently"}
                </span>
              )}
            </div>
            <div
              className="relative mt-2 h-12"
              role="img"
              aria-label={`${info.name}: ${placed.map((d) => `${d.label} ${d.v}`).join(", ")}, on a scale of 1 to 10`}
            >
              <div className="absolute inset-x-3.5 top-1/2 h-0.5 -translate-y-1/2 bg-foreground/15" />
              {row.low !== null && row.high !== null && row.points >= 2 && (
                <div className="absolute inset-y-0 inset-x-3.5">
                  <i
                    className="absolute top-[10px] bottom-[10px] rounded-md border border-dashed border-foreground/30 bg-foreground/[0.05]"
                    style={{ left: `${pct(row.low)}%`, width: `${pct(row.high) - pct(row.low)}%` }}
                  />
                </div>
              )}
              <div className="absolute inset-y-0 inset-x-3.5">
                {placed.map((d) => (
                  <b
                    key={d.key}
                    title={`${d.label}: ${d.v}`}
                    className="absolute top-1/2 grid h-[26px] w-[26px] place-items-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
                    style={{ left: `${d.p}%`, background: d.color, transform: `translate(-50%, calc(-50% + ${d.dy}px))` }}
                  >
                    {d.short}
                  </b>
                ))}
              </div>
            </div>
            <div className="flex justify-between px-0.5 text-[11px] text-foreground/50">
              <span>{info.lowLabel}</span>
              <span>{info.highLabel}</span>
            </div>
            <p className="mt-1 text-xs tabular-nums text-foreground/75">
              {row.self !== null && <span className="mr-3 font-semibold" style={{ color: COLOR_ME }}>You {row.self}</span>}
              {row.others !== null ? (
                <span>
                  Others {row.others}
                  {row.points >= 2 && row.low !== null && row.high !== null && ` (range ${row.low} to ${row.high})`}
                </span>
              ) : (
                <span className="text-foreground/50">No ratings yet on this axis</span>
              )}
            </p>
            {EXPRESSION_NOTE[row.axis] && row.others !== null && (
              <p className="mt-1 text-xs text-foreground/55">{EXPRESSION_NOTE[row.axis]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
