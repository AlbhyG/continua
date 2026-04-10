import type { OrbData } from "@/components/PersonalityOrb";
import type { AxisScores } from "./scoring";

/**
 * Map a 6-axis score profile to the 12-pole OrbData format used by
 * the PersonalityOrb WebGL component.
 *
 * Each axis (1–10) splits into two opposing pole intensities. A score
 * of 10 means full strength on the "high" pole and minimal on the
 * "low" pole; a score of 1 is the reverse.
 */
export function scoresToOrbData(scores: Partial<AxisScores>): OrbData {
  const e = scores.empathy ?? 5.5;
  const s = scores.self_orientation ?? 5.5;
  const a = scores.social_attunement ?? 5.5;
  const c = scores.conscientiousness ?? 5.5;
  const ag = scores.agency ?? 5.5;
  const r = scores.reactivity ?? 5.5;

  return {
    yellow: e,            // High Empathy
    navy: 11 - e,         // Low Empathy (Detachment)
    indigo: s,            // Self-Focused (high end of self-orientation)
    chartreuse: 11 - s,   // Altruistic (low end)
    lime: a,              // Hyper-Socially Attuned
    violet: 11 - a,       // Hypo-Socially Attuned
    emerald: c,           // Conscientious
    magenta: 11 - c,      // Impulsive / Spontaneous
    red: ag,              // Agentic / Dominant
    teal: 11 - ag,        // Yielding / Submissive
    orange: r,            // High Reactivity
    blue: 11 - r,         // Low Reactivity
  };
}
