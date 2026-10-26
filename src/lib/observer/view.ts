import { AXIS_ORDER } from "@/lib/comparison/compare";
import { AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import type { Axis, ObserverScores } from "./scoring";

// Turns a person's self-rating and the ratings others made of them into what
// the "How others see you" page shows. Pure, so the anonymity rules can be
// tested directly.
//
// Anonymity rule: anonymous ratings count toward anything shown (their
// average, the range across raters, the overall average, the gaps) only once
// there are at least MIN_ANONYMOUS of them. With one, its scores could be
// read straight off the range or the average, so it is held back entirely.

export const MIN_ANONYMOUS = 2;
// A gap between the self-rating and others' average this large is mentioned.
export const GAP_MENTION = 1.5;
// Raters this far apart on an axis are mentioned as seeing different sides.
export const SPREAD_MENTION = 3;

export type RelationshipKey = "partner" | "family" | "friend" | "coworker" | "other";
export const RELATIONSHIP_LABEL: Record<RelationshipKey, string> = {
  partner: "Partner",
  family: "Family",
  friend: "Friend",
  coworker: "Coworker",
  other: "Other",
};

export type RatingInput = {
  id: string;
  isNamed: boolean;
  raterName: string | null;
  /** The address the subject invited. Only kept, and only shown, for named ratings. */
  email: string | null;
  relationship: RelationshipKey | null;
  scores: ObserverScores;
  /** Share of this rater's items on each axis answered "Can't tell" (0 to 1). */
  cantTellShare: Record<Axis, number>;
};

export type NamedRater = { id: string; name: string; email: string | null; relationship: RelationshipKey | null };

export type AxisView = {
  axis: Axis;
  self: number | null;
  named: { id: string; value: number }[];
  anonymousAverage: number | null;
  /** Average of every rating shown, named and (if enough) anonymous. */
  othersAverage: number | null;
  low: number | null;
  high: number | null;
  /** Number of shown ratings that scored this axis. */
  count: number;
  /** Average share of "Can't tell" answers on this axis across shown raters. */
  cantTellShare: number;
};

export type Observation = { axis: Axis; kind: "gap" | "spread"; text: string };

export type OthersView = {
  named: NamedRater[];
  anonymousShown: number;
  anonymousHeldBack: number;
  axes: AxisView[];
  observations: Observation[];
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (xs: number[]) => (xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

export function buildOthersView(self: AxisScores | null, ratings: RatingInput[]): OthersView {
  const named = ratings.filter((r) => r.isNamed);
  const anonymous = ratings.filter((r) => !r.isNamed);
  const showAnonymous = anonymous.length >= MIN_ANONYMOUS;
  const shown = showAnonymous ? ratings : named;

  const axes = AXIS_ORDER.map((axis): AxisView => {
    const values = (rs: RatingInput[]) =>
      rs.map((r) => r.scores[axis]).filter((v): v is number => typeof v === "number");
    const all = values(shown);
    const anon = showAnonymous ? values(anonymous) : [];
    return {
      axis,
      self: self ? self[axis] : null,
      named: named
        .filter((r) => typeof r.scores[axis] === "number")
        .map((r) => ({ id: r.id, value: r.scores[axis] as number })),
      anonymousAverage: anon.length >= MIN_ANONYMOUS ? mean(anon) : null,
      othersAverage: mean(all),
      low: all.length ? Math.min(...all) : null,
      high: all.length ? Math.max(...all) : null,
      count: all.length,
      cantTellShare: shown.length
        ? Math.round((shown.reduce((s, r) => s + r.cantTellShare[axis], 0) / shown.length) * 100) / 100
        : 0,
    };
  });

  return {
    named: named.map((r) => ({
      id: r.id,
      name: r.raterName ?? "Someone",
      email: r.email,
      relationship: r.relationship,
    })),
    anonymousShown: showAnonymous ? anonymous.length : 0,
    anonymousHeldBack: showAnonymous ? 0 : anonymous.length,
    axes,
    observations: observationsFor(axes),
  };
}

// Plain sentences about the largest differences: first where others' average
// differs most from the self-rating, then where raters disagree most with each
// other. Worded as positions on a scale, never as better or worse.
export function observationsFor(axes: AxisView[]): Observation[] {
  const gaps = axes
    .filter((a) => a.self !== null && a.othersAverage !== null)
    .map((a) => ({ a, diff: round1((a.othersAverage as number) - (a.self as number)) }))
    .filter(({ diff }) => Math.abs(diff) >= GAP_MENTION)
    .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff))
    .slice(0, 3)
    .map(({ a, diff }): Observation => {
      const info = AXIS_INFO[a.axis];
      const pole = diff > 0 ? info.highLabel : info.lowLabel;
      const who = a.count === 1 ? "The person who described you places" : "The people who described you place";
      return {
        axis: a.axis,
        kind: "gap",
        text: `${who} you further toward ${pole} on ${info.name} than you place yourself (you ${a.self}, ${a.count === 1 ? "them" : "their average"} ${a.othersAverage}).`,
      };
    });

  const spreads = axes
    .filter((a) => a.count >= 2 && a.low !== null && a.high !== null && a.high - a.low >= SPREAD_MENTION)
    .sort((x, y) => (y.high as number) - (y.low as number) - ((x.high as number) - (x.low as number)))
    .slice(0, 2)
    .map((a): Observation => ({
      axis: a.axis,
      kind: "spread",
      text: `People see you quite differently on ${AXIS_INFO[a.axis].name} (from ${a.low} to ${a.high}). They may be seeing different parts of your range.`,
    }));

  return [...gaps, ...spreads];
}
