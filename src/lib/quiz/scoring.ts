export type Direction =
  | "empathy" | "detachment"
  | "altruism" | "self-focus"
  | "hyper-attuned" | "hypo-attuned"
  | "conscientious" | "spontaneous"
  | "agentic" | "yielding"
  | "high-reactive" | "low-reactive";

export interface Question {
  text: string;
  direction: Direction;
}

export interface Questionnaire {
  id: number;
  questions: Question[];
}

export interface AxisScores {
  empathy: number;
  self_orientation: number;
  social_attunement: number;
  conscientiousness: number;
  agency: number;
  reactivity: number;
}

// Which directions map to which axis
// pole: "high" means agreeing (Likert 1) gives raw score 1 → scales to low end (1-3)
// pole: "low" means agreeing (Likert 1) gives raw score 5 → scales to high end (8-10)
// Book convention: high score (8-10) = the named "High End" of each axis
const AXIS_MAP: Record<string, { axis: keyof AxisScores; pole: "high" | "low" }> = {
  empathy:        { axis: "empathy", pole: "low" },          // agree → high score (Highly Empathic)
  detachment:     { axis: "empathy", pole: "high" },         // agree → low score (Detached)
  altruism:       { axis: "self_orientation", pole: "high" }, // agree → low score (Altruistic)
  "self-focus":   { axis: "self_orientation", pole: "low" },  // agree → high score (Self-Focused)
  "hyper-attuned":{ axis: "social_attunement", pole: "low" }, // agree → high score (Hyper-Attuned)
  "hypo-attuned": { axis: "social_attunement", pole: "high" },// agree → low score (Hypo-Attuned)
  conscientious:  { axis: "conscientiousness", pole: "low" }, // agree → high score (Conscientious)
  spontaneous:    { axis: "conscientiousness", pole: "high" },// agree → low score (Spontaneous)
  agentic:        { axis: "agency", pole: "low" },            // agree → high score (Agentic)
  yielding:       { axis: "agency", pole: "high" },           // agree → low score (Yielding)
  "high-reactive":{ axis: "reactivity", pole: "low" },        // agree → high score (Highly Reactive)
  "low-reactive": { axis: "reactivity", pole: "high" },       // agree → low score (Low Reactivity)
};

// Score a single question: 1-5 Likert mapped so "high" pole agree = 1, "low" pole agree = 5
function scoreQuestion(likertValue: number, direction: Direction): { axis: keyof AxisScores; score: number } {
  const mapping = AXIS_MAP[direction];
  const score = mapping.pole === "high" ? likertValue : (6 - likertValue);
  return { axis: mapping.axis, score };
}

function scaleToTen(rawScores: number[]): number {
  if (rawScores.length === 0) return 5.5;
  const mean = rawScores.reduce((a, b) => a + b, 0) / rawScores.length;
  const scaled = ((mean - 1) / 4) * 9 + 1;
  return Math.round(scaled * 10) / 10;
}

export function calculateScores(answers: number[], questions: Question[]): AxisScores {
  const buckets: Record<keyof AxisScores, number[]> = {
    empathy: [], self_orientation: [], social_attunement: [],
    conscientiousness: [], agency: [], reactivity: [],
  };

  answers.forEach((answer, i) => {
    const { axis, score } = scoreQuestion(answer, questions[i].direction);
    buckets[axis].push(score);
  });

  return {
    empathy: scaleToTen(buckets.empathy),
    self_orientation: scaleToTen(buckets.self_orientation),
    social_attunement: scaleToTen(buckets.social_attunement),
    conscientiousness: scaleToTen(buckets.conscientiousness),
    agency: scaleToTen(buckets.agency),
    reactivity: scaleToTen(buckets.reactivity),
  };
}

// Legacy single-score function for backwards compat
export function calculateScore(answers: number[], questions: Question[]): number {
  const scores = calculateScores(answers, questions);
  return scores.empathy;
}

export const AXIS_INFO: Record<keyof AxisScores, { name: string; highLabel: string; lowLabel: string }> = {
  empathy:           { name: "Empathy–Detachment",      highLabel: "Highly Empathic",       lowLabel: "Detached / Analytical" },
  self_orientation:  { name: "Self-Orientation",         highLabel: "Self-Focused / Ambitious", lowLabel: "Altruistic / Self-Transcendent" },
  social_attunement: { name: "Social Attunement",        highLabel: "Hyper-Attuned",          lowLabel: "Hypo-Attuned" },
  conscientiousness: { name: "Conscientiousness",        highLabel: "Highly Conscientious",   lowLabel: "Spontaneous" },
  agency:            { name: "Agency",                   highLabel: "Agentic / Assertive",    lowLabel: "Yielding / Accommodating" },
  reactivity:        { name: "Reactivity",               highLabel: "Highly Reactive",        lowLabel: "Low Reactivity" },
};

export function getLabel(score: number): string {
  if (score >= 8) return "Highly Empathic";
  if (score >= 4) return "Balanced / Adaptive Empathy";
  return "Detached / Analytical";
}

export function getAxisLabel(axis: keyof AxisScores, score: number): string {
  const info = AXIS_INFO[axis];
  if (score <= 3) return info.lowLabel;
  if (score >= 8) return info.highLabel;
  return "Balanced";
}

export function getExplanation(score: number): string {
  if (score >= 8) {
    return "You register others' suffering as a felt weight — a moral force that generates genuine concern and a sustained motivation to respond.";
  }
  if (score >= 4) {
    return "You occupy the adaptive middle — responsive to others' suffering without being consumed by it, integrating feeling with reason.";
  }
  return "You process others' suffering primarily as information — evaluating it objectively and prioritizing analytical clarity.";
}
