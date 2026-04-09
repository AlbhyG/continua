import fs from "fs";
import path from "path";
import type { Questionnaire } from "./scoring";

let cache: Questionnaire[] | null = null;

export function getAllQuestionnaires(): Questionnaire[] {
  if (cache) return cache;
  const dir = path.join(process.cwd(), "data", "questionnaires");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  cache = files.map((f) => {
    const content = fs.readFileSync(path.join(dir, f), "utf-8");
    return JSON.parse(content) as Questionnaire;
  });
  return cache;
}

export function getQuestionnaire(id: number): Questionnaire | undefined {
  return getAllQuestionnaires().find((q) => q.id === id);
}

export function getRandomUncompletedId(completedIds: number[]): number | null {
  const all = getAllQuestionnaires();
  const available = all.filter((q) => !completedIds.includes(q.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)].id;
}
