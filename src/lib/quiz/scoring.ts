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

// Which directions map to which axis, and which pole is "high" (score 1) vs "low" (score 10)
const AXIS_MAP: Record<string, { axis: keyof AxisScores; pole: "high" | "low" }> = {
  empathy:        { axis: "empathy", pole: "high" },
  detachment:     { axis: "empathy", pole: "low" },
  altruism:       { axis: "self_orientation", pole: "high" },
  "self-focus":   { axis: "self_orientation", pole: "low" },
  "hyper-attuned":{ axis: "social_attunement", pole: "high" },
  "hypo-attuned": { axis: "social_attunement", pole: "low" },
  conscientious:  { axis: "conscientiousness", pole: "high" },
  spontaneous:    { axis: "conscientiousness", pole: "low" },
  agentic:        { axis: "agency", pole: "high" },
  yielding:       { axis: "agency", pole: "low" },
  "high-reactive":{ axis: "reactivity", pole: "high" },
  "low-reactive": { axis: "reactivity", pole: "low" },
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
  self_orientation:  { name: "Self-Orientation",         highLabel: "Altruistic",             lowLabel: "Self-Focused" },
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
