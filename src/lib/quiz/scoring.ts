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
  social_attunement: number;
  empathy: number;
  self_orientation: number;
  conscientiousness: number;
  agency: number;
  reactivity: number;
}

// Which directions map to which axis
// pole: "high" means agreeing (Likert 1) gives raw score 1 → scales to low end (1-3)
// pole: "low" means agreeing (Likert 1) gives raw score 5 → scales to high end (8-10)
// Book convention: high score (8-10) = the named "High End" of each axis
const AXIS_MAP: Record<string, { axis: keyof AxisScores; pole: "high" | "low" }> = {
  empathy:        { axis: "empathy", pole: "low" },          // agree → high score (Highly Empathetic)
  detachment:     { axis: "empathy", pole: "high" },         // agree → low score (Detached)
  altruism:       { axis: "self_orientation", pole: "high" }, // agree → low score (Altruistic)
  "self-focus":   { axis: "self_orientation", pole: "low" },  // agree → high score (Self-Oriented)
  "hyper-attuned":{ axis: "social_attunement", pole: "low" }, // agree → high score (Hyper-Attuned)
  "hypo-attuned": { axis: "social_attunement", pole: "high" },// agree → low score (Hypo-Attuned)
  conscientious:  { axis: "conscientiousness", pole: "low" }, // agree → high score (Conscientious)
  spontaneous:    { axis: "conscientiousness", pole: "high" },// agree → low score (Spontaneous)
  agentic:        { axis: "agency", pole: "low" },            // agree → high score (Agentic)
  yielding:       { axis: "agency", pole: "high" },           // agree → low score (Accommodating)
  "high-reactive":{ axis: "reactivity", pole: "low" },        // agree → high score (Highly Reactive)
  "low-reactive": { axis: "reactivity", pole: "high" },       // agree → low score (Calm)
};

// Score a single question: 1-5 Likert mapped so "high" pole agree = 1, "low" pole agree = 5
export function scoreQuestion(likertValue: number, direction: Direction): { axis: keyof AxisScores; score: number } {
  const mapping = AXIS_MAP[direction];
  const score = mapping.pole === "high" ? likertValue : (6 - likertValue);
  return { axis: mapping.axis, score };
}

export function scaleToTen(rawScores: number[]): number {
  if (rawScores.length === 0) return 5.5;
  const mean = rawScores.reduce((a, b) => a + b, 0) / rawScores.length;
  const scaled = ((mean - 1) / 4) * 9 + 1;
  return Math.round(scaled * 10) / 10;
}

export function calculateScores(answers: number[], questions: Question[]): AxisScores {
  const buckets: Record<keyof AxisScores, number[]> = {
    social_attunement: [], empathy: [], self_orientation: [],
    conscientiousness: [], agency: [], reactivity: [],
  };

  answers.forEach((answer, i) => {
    const { axis, score } = scoreQuestion(answer, questions[i].direction);
    buckets[axis].push(score);
  });

  return {
    social_attunement: scaleToTen(buckets.social_attunement),
    empathy: scaleToTen(buckets.empathy),
    self_orientation: scaleToTen(buckets.self_orientation),
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

export const AXIS_INFO: Record<keyof AxisScores, { name: string; highLabel: string; lowLabel: string; middleLabel: string }> = {
  social_attunement: { name: "Social Attunement", highLabel: "Hyper-Attuned",      lowLabel: "Hypo-Attuned",  middleLabel: "Moderate Attunement" },
  empathy:           { name: "Empathy",           highLabel: "Highly Empathetic",  lowLabel: "Detached",      middleLabel: "Moderate Empathy" },
  self_orientation:  { name: "Self-Orientation",  highLabel: "Self-Oriented",      lowLabel: "Altruistic",    middleLabel: "Moderate Self-Orientation" },
  conscientiousness: { name: "Conscientiousness", highLabel: "Disciplined",        lowLabel: "Spontaneous",   middleLabel: "Moderate Conscientiousness" },
  agency:            { name: "Agency",            highLabel: "Agentic",            lowLabel: "Accommodating", middleLabel: "Moderate Agency" },
  reactivity:        { name: "Reactivity",        highLabel: "Highly Reactive",    lowLabel: "Calm",          middleLabel: "Moderately Reactive" },
};
// Pole and band labels match Appendix 1 of the book (Oct 11, 2026).

export function getLabel(score: number): string {
  return getAxisLabel("empathy", score);
}

export function getAxisLabel(axis: keyof AxisScores, score: number): string {
  const info = AXIS_INFO[axis];
  if (score <= 3) return info.lowLabel;
  if (score >= 8) return info.highLabel;
  return info.middleLabel;
}

export function getExplanation(score: number): string {
  if (score >= 8) {
    return "Others' welfare carries substantial moral and emotional weight for you. You are genuinely moved by suffering and feel compelled to respond.";
  }
  if (score > 3) {
    return "You feel genuine concern for others while keeping limits on your sense of obligation. You can be moved by suffering without feeling responsible for every hardship you encounter.";
  }
  return "Others' suffering carries relatively little weight for you, and you feel less pull to respond than most people do. This is not the same as being calm or analytical; many composed, analytical people care deeply.";
}
