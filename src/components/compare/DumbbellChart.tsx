import { AXIS_INFO } from "@/lib/quiz/scoring";
import type { AxisComparison } from "@/lib/comparison/compare";

// Two stable colors: the person viewing is always teal, the other person amber.
// (No red/green, and nothing that implies a winner.)
export const COLOR_ME = "#1d7f6a";
export const COLOR_OTHER = "#b8730a";

const pct = (v: number) => ((v - 1) / 9) * 100;

// Dots are 26px wide, so two close scores would draw one dot on top of the
// other. When they are this close (in % of the track), nudge them apart
// sideways so both stay visible; the exact numbers are in the caption.
const CLOSE_PCT = 8;
const NUDGE_PX = 11;
function dotLefts(a: number, b: number): [string, string] {
  const pa = pct(a);
  const pb = pct(b);
  if (Math.abs(pa - pb) >= CLOSE_PCT) return [`${pa}%`, `${pb}%`];
  const mid = (pa + pb) / 2;
  // Keep their left-to-right order; on a tie, the viewer goes on the left.
  const aLeft = pa <= pb;
  return aLeft
    ? [`calc(${mid}% - ${NUDGE_PX}px)`, `calc(${mid}% + ${NUDGE_PX}px)`]
    : [`calc(${mid}% + ${NUDGE_PX}px)`, `calc(${mid}% - ${NUDGE_PX}px)`];
}

export function initials(a: string, b: string): [string, string] {
  const x = (a.trim()[0] ?? "A").toUpperCase();
  const y = (b.trim()[0] ?? "B").toUpperCase();
  return x === y ? ["1", "2"] : [x, y];
}

// One row per axis in a fixed order: a dot per person on a 1 to 10 track, the
// dashed band between them showing the span the pair covers together, and a caption.
export default function DumbbellChart({
  axes,
  names,
}: {
  axes: AxisComparison[];
  names: { a: string; b: string };
}) {
  const [ia, ib] = initials(names.a, names.b);
  return (
    <div>
      {axes.map((axis) => {
        const info = AXIS_INFO[axis.axis];
        const [leftA, leftB] = dotLefts(axis.a, axis.b);
        return (
          <div key={axis.axis} className="border-t border-foreground/10 py-3 first:border-t-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold">{info.name}</span>
              <span className="text-xs tabular-nums text-foreground/55">gap {axis.gap}</span>
            </div>
            <div
              className="relative mt-2 h-8"
              role="img"
              aria-label={`${info.name}: ${names.a} ${axis.a}, ${names.b} ${axis.b} on a scale of 1 to 10`}
            >
              <div className="absolute inset-x-3.5 top-1/2 h-0.5 -translate-y-1/2 bg-foreground/15" />
              <div className="absolute inset-y-0 inset-x-3.5">
                <i
                  className="absolute top-[3px] bottom-[3px] rounded-md border border-dashed border-foreground/40 bg-foreground/[0.07]"
                  style={{ left: `${pct(axis.low)}%`, width: `${pct(axis.high) - pct(axis.low)}%` }}
                />
                <b
                  className="absolute top-1/2 grid h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-xs font-semibold text-white"
                  style={{ left: leftA, background: COLOR_ME }}
                >
                  {ia}
                </b>
                <b
                  className="absolute top-1/2 grid h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-xs font-semibold text-white"
                  style={{ left: leftB, background: COLOR_OTHER }}
                >
                  {ib}
                </b>
              </div>
            </div>
            <div className="flex justify-between px-0.5 text-[11px] text-foreground/50">
              <span>{info.lowLabel}</span>
              <span>{info.highLabel}</span>
            </div>
            <p className="mt-1 text-xs tabular-nums">
              <span className="mr-3 font-semibold" style={{ color: COLOR_ME }}>{names.a} {axis.a}</span>
              <span className="font-semibold" style={{ color: COLOR_OTHER }}>{names.b} {axis.b}</span>
            </p>
            <p className="mt-0.5 text-xs text-foreground/65">
              {axis.low === axis.high ? (
                <>
                  Both at <b className="text-foreground">{axis.low}</b>
                </>
              ) : (
                <>
                  Between you: <b className="text-foreground">{axis.low} to {axis.high}</b>
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
