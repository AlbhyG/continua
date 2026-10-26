import fs from "fs";
import path from "path";
import { getQuestionnaire } from "@/lib/quiz/questionnaires";
import { DEFAULT_PRONOUN, itemName, renderItem, type Pronoun } from "./pronouns";

export { itemName, renderItem };

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

// The observer questionnaire for one questionnaire id, rendered for a name
// and the way the person chose to be referred to.
// Returns null if the questionnaire or any of its items is missing.
export function observerQuestions(
  questionnaireId: number,
  displayName: string,
  pronoun: Pronoun = DEFAULT_PRONOUN
): { text: string; direction: string }[] | null {
  const q = getQuestionnaire(questionnaireId);
  if (!q) return null;
  const all = templates();
  const name = itemName(displayName);
  const out: { text: string; direction: string }[] = [];
  for (let i = 0; i < q.questions.length; i++) {
    const t = all[`${questionnaireId}:${i}`];
    if (!t) return null;
    out.push({ text: renderItem(t, name, pronoun), direction: q.questions[i].direction });
  }
  return out;
}
