import fs from "fs";
import path from "path";
import { getQuestionnaire } from "@/lib/quiz/questionnaires";

// Third-person versions of the questionnaire items, for people rating someone
// else. Built by scripts/build-observer-items.py; keyed "questionnaireId:index",
// with {name} where the person's name goes.

let cache: Record<string, string> | null = null;

function templates(): Record<string, string> {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "observer-items", "observer-items.json");
  cache = JSON.parse(fs.readFileSync(file, "utf-8")) as Record<string, string>;
  return cache;
}

// The name used inside items: the first word of the person's display name, so
// a full name reads "Albhy rarely notices..." rather than "Albhy Galuten
// rarely notices...".
export function itemName(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0] ?? "";
  return first || "this person";
}

export function renderItem(template: string, name: string): string {
  const out = template.replaceAll("{name}", name);
  // Templates can start with {name}; a lowercase fallback name ("this person")
  // still needs a capital at the start of the sentence.
  return out.charAt(0).toUpperCase() + out.slice(1);
}

// The observer questionnaire for one questionnaire id, rendered for a name.
// Returns null if the questionnaire or any of its items is missing.
export function observerQuestions(
  questionnaireId: number,
  displayName: string
): { text: string; direction: string }[] | null {
  const q = getQuestionnaire(questionnaireId);
  if (!q) return null;
  const all = templates();
  const name = itemName(displayName);
  const out: { text: string; direction: string }[] = [];
  for (let i = 0; i < q.questions.length; i++) {
    const t = all[`${questionnaireId}:${i}`];
    if (!t) return null;
    out.push({ text: renderItem(t, name), direction: q.questions[i].direction });
  }
  return out;
}
