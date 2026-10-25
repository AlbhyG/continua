import { scaleToTen, scoreQuestion, type AxisScores, type Direction } from "@/lib/quiz/scoring";
import { AXIS_ORDER } from "@/lib/comparison/compare";

// Scoring for ratings of someone else. Same items and the same 1 to 10 scale
// as the self assessment, with one difference: raters can answer "Can't tell"
// (stored as 0), which is left out of the score rather than counted as a
// middle answer. An axis needs at least MIN_ANSWERED_PER_AXIS answered items
// to be scored; otherwise it is null.

export const CANT_TELL = 0;
export const MIN_ANSWERED_PER_AXIS = 2;

export type Axis = keyof AxisScores;
export type ObserverScores = Record<Axis, number | null>;

export function isValidObserverAnswer(a: unknown): a is number {
  return typeof a === "number" && Number.isInteger(a) && a >= 0 && a <= 5;
}

export function scoreObserverAnswers(
  answers: number[],
  questions: { direction: string }[]
): { scores: ObserverScores; answered: Record<Axis, number>; cantTell: Record<Axis, number> } {
  const raw = Object.fromEntries(AXIS_ORDER.map((a) => [a, [] as number[]])) as Record<Axis, number[]>;
  const answered = Object.fromEntries(AXIS_ORDER.map((a) => [a, 0])) as Record<Axis, number>;
  const cantTell = Object.fromEntries(AXIS_ORDER.map((a) => [a, 0])) as Record<Axis, number>;

  answers.forEach((answer, i) => {
    // Scoring a placeholder answer just looks up which axis the item is on.
    const { axis } = scoreQuestion(1, questions[i].direction as Direction);
    if (answer === CANT_TELL) {
      cantTell[axis] += 1;
      return;
    }
    raw[axis].push(scoreQuestion(answer, questions[i].direction as Direction).score);
    answered[axis] += 1;
  });

  const scores = Object.fromEntries(
    AXIS_ORDER.map((a) => [a, raw[a].length >= MIN_ANSWERED_PER_AXIS ? scaleToTen(raw[a]) : null])
  ) as ObserverScores;
  return { scores, answered, cantTell };
}
