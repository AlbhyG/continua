import { calculateScores, type AxisScores, type Question } from "@/lib/quiz/scoring";

export type PartialScores = Record<keyof AxisScores, number | null>;

// Each axis needs at least this many answered questions (out of six) to be scored.
export const MIN_ANSWERED_PER_AXIS = 3;

const AXES: Array<keyof AxisScores> = [
  "social_attunement",
  "empathy",
  "self_orientation",
  "conscientiousness",
  "agency",
  "reactivity",
];

// Scores a rater's answers the same way as a self-assessment, leaving out
// "Can't tell" (0). An axis with too few answers is null.
export function scoreRating(answers: number[], questions: Question[]): PartialScores {
  if (answers.length !== questions.length) throw new Error("answer count mismatch");
  const out = {} as PartialScores;
  for (const axis of AXES) {
    const idx = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => axisOf(q) === axis && answers[i] >= 1 && answers[i] <= 5);
    if (idx.length < MIN_ANSWERED_PER_AXIS) {
      out[axis] = null;
      continue;
    }
    const scored = calculateScores(
      idx.map(({ i }) => answers[i]),
      idx.map(({ q }) => q)
    );
    out[axis] = scored[axis];
  }
  return out;
}

function axisOf(q: Question): keyof AxisScores {
  // calculateScores on a single neutral answer tells us which axis moved.
  const probe = calculateScores([1], [q]);
  const moved = AXES.find((a) => probe[a] !== 5.5);
  if (!moved) throw new Error(`unknown direction ${q.direction}`);
  return moved;
}

export function isValidAnswers(answers: unknown, count: number): answers is number[] {
  return (
    Array.isArray(answers) &&
    answers.length === count &&
    answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 5)
  );
}

export { AXES };
