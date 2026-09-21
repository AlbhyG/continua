import type { AxisScores } from "@/lib/quiz/scoring";

// Fixed axis order for every comparison; never reordered by gap size.
export const AXIS_ORDER: Array<keyof AxisScores> = [
  "social_attunement",
  "empathy",
  "self_orientation",
  "conscientiousness",
  "agency",
  "reactivity",
];

// Thresholds on the 1 to 10 scale. Editorial choices, easy to change here.
export const ALIGNED_MAX_GAP = 2; // a gap of 2 or more points is "divergent"
export const HIGH_MIN = 7; // both at or above: "aligned high"
export const LOW_MAX = 4; // both at or below: "aligned low"

export type Shape =
  | "aligned_high"
  | "aligned_low"
  | "aligned_middle"
  | "divergent";

export interface AxisComparison {
  axis: keyof AxisScores;
  a: number;
  b: number;
  gap: number;
  /** Which person scored higher on this axis, or null if identical. */
  higher: "a" | "b" | null;
  /** The span the pair covers together on this axis. */
  low: number;
  high: number;
  shape: Shape;
}

export interface Comparison {
  axes: AxisComparison[];
  /** First axis (in fixed order) with the largest gap. */
  largestGap: { axis: keyof AxisScores; gap: number };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function shapeFor(a: number, b: number): Shape {
  const gap = Math.abs(a - b);
  if (gap >= ALIGNED_MAX_GAP) return "divergent";
  if (a >= HIGH_MIN && b >= HIGH_MIN) return "aligned_high";
  if (a <= LOW_MAX && b <= LOW_MAX) return "aligned_low";
  return "aligned_middle";
}

// Per-axis comparison of two profiles. Pure and order-independent in the sense
// that it takes exactly two profile objects, so it can later compose over groups.
export function compareProfiles(a: AxisScores, b: AxisScores): Comparison {
  const axes = AXIS_ORDER.map((axis): AxisComparison => {
    const av = a[axis];
    const bv = b[axis];
    return {
      axis,
      a: av,
      b: bv,
      gap: round1(Math.abs(av - bv)),
      higher: av === bv ? null : av > bv ? "a" : "b",
      low: Math.min(av, bv),
      high: Math.max(av, bv),
      shape: shapeFor(av, bv),
    };
  });
  let largest = axes[0];
  for (const item of axes) if (item.gap > largest.gap) largest = item;
  return { axes, largestGap: { axis: largest.axis, gap: largest.gap } };
}
