import type { AxisScores } from "@/lib/quiz/scoring";

export interface FamousFigureProfile {
  name: string;
  primary: FamousFigureCategory;
  tags: string;
  scores: AxisScores;
}

export const FAMOUS_FIGURE_CATEGORIES = [
  { key: "Narcissist", title: "Narcissists" },
  { key: "Altruist", title: "Altruists" },
  { key: "Hyper-Empathic", title: "Hyper-Empathics" },
  { key: "Hypo-Attuned", title: "Hypo-Attuneds" },
  { key: "Conscientious", title: "Conscientious" },
  { key: "Impulsive", title: "Impulsives" },
  { key: "Assertive", title: "Assertives" },
  { key: "Submissive", title: "Submissives" },
  { key: "High-Reactive", title: "High-Reactives" },
  { key: "Low-Reactive", title: "Low-Reactives" },
] as const;

export type FamousFigureCategory = (typeof FAMOUS_FIGURE_CATEGORIES)[number]["key"];

export function groupFamousFiguresByCategory(profiles: FamousFigureProfile[]) {
  const grouped = new Map<FamousFigureCategory, FamousFigureProfile[]>();

  for (const profile of profiles) {
    const categoryProfiles = grouped.get(profile.primary) ?? [];
    categoryProfiles.push(profile);
    grouped.set(profile.primary, categoryProfiles);
  }

  return grouped;
}
