export type Direction = "empathy" | "detachment";

export interface Question {
  text: string;
  direction: Direction;
}

export interface Questionnaire {
  id: number;
  questions: Question[];
}

// Likert values: 1=Strongly Agree, 2=Agree, 3=Neutral, 4=Disagree, 5=Strongly Disagree
export function scoreQuestion(
  likertValue: number,
  direction: Direction
): number {
  if (direction === "empathy") {
    return likertValue; // SA=1(empathy), SD=5(detachment)
  } else {
    return 6 - likertValue; // SA=5(detachment), SD=1(empathy)
  }
}

export function calculateScore(
  answers: number[],
  questions: Question[]
): number {
  const scores = answers.map((answer, i) =>
    scoreQuestion(answer, questions[i].direction)
  );
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  // Map 1-5 mean to 1-10 scale
  const scaled = ((mean - 1) / 4) * 9 + 1;
  return Math.round(scaled * 10) / 10;
}

export function getLabel(score: number): string {
  if (score >= 8) return "Highly Empathic";
  if (score >= 4) return "Balanced / Adaptive Empathy";
  return "Detached / Analytical";
}

export function getExplanation(score: number): string {
  if (score >= 8) {
    return "You register others' suffering as a felt weight — a moral force that generates genuine concern and a sustained motivation to respond. The pain of others carries real priority in your decision-making, and you experience the obligation to act as one of the most reliable moral signals in your life. This deep moral engagement allows you to connect meaningfully with those who are struggling, though it may require attention to sustainability.";
  }
  if (score >= 4) {
    return "You occupy the adaptive middle of the Empathy–Detachment spectrum. You are responsive to others' suffering without being consumed by it, integrating feeling with reason. You can attune to the moral weight of a situation when needed while maintaining the analytical clarity to act effectively. This balance allows you to engage with suffering in a way that is both principled and sustainable.";
  }
  return "You process others' suffering primarily as information — evaluating it objectively and prioritizing analytical clarity in your response. Rather than experiencing pain as a felt weight, you engage with it through structured reasoning and principled assessment. This detached, analytical approach enables clear-headed decision-making and is especially adaptive in professional contexts where emotional distance allows for more equitable and effective action.";
}
