import raterQuestions from "../../../data/rater-questions.json";
import type { Direction } from "@/lib/quiz/scoring";

// Questions written about another person, for How Others See You.
//
// data/rater-questions.json maps each original first-person question to a
// template. Templates use {name} for the person being rated, and pronoun
// tokens so they read correctly for he, she or they:
//   {they} {their} {them} {themself}   and   {V:knows/know}
// where {V:...} is a verb after a subject pronoun ("he knows", "they know").
// Questions flagged "inner" turn an inner feeling into what an observer can
// see, so on those questions a rater is judging expression, not feeling.

export type Pronoun = "he" | "she" | "they";

type Entry = { rater: string; flag: string | null; axis: string; direction: Direction };
const TABLE = raterQuestions as Record<string, Entry>;

const FORMS: Record<Pronoun, { they: string; their: string; them: string; themself: string; s: boolean }> = {
  he: { they: "he", their: "his", them: "him", themself: "himself", s: true },
  she: { they: "she", their: "her", them: "her", themself: "herself", s: true },
  they: { they: "they", their: "their", them: "them", themself: "themself", s: false },
};

export function isPronoun(v: unknown): v is Pronoun {
  return v === "he" || v === "she" || v === "they";
}

export function renderTemplate(template: string, name: string, pronoun: Pronoun): string {
  const f = FORMS[pronoun];
  return template
    .replace(/\{V:([^/}]+)\/([^}]+)\}/g, (_m, third: string, plain: string) => (f.s ? third : plain))
    .replace(/\{themself\}/g, f.themself)
    .replace(/\{their\}/g, f.their)
    .replace(/\{them\}/g, f.them)
    .replace(/\{they\}/g, f.they)
    .replace(/\{name\}/g, name);
}

// The rater version of a first-person question, or null if there isn't one.
export function raterText(original: string, name: string, pronoun: Pronoun): string | null {
  const entry = TABLE[original];
  return entry ? renderTemplate(entry.rater, name, pronoun) : null;
}

export function hasRaterVersion(original: string): boolean {
  return original in TABLE;
}

// Answer choices for raters. Values match the self-assessment (1 = "Very much
// me"), so scoring is the same; 0 means "Can't tell" and is left out.
export function raterOptions(name: string) {
  return [
    { value: 1, label: `Very much like ${name}` },
    { value: 2, label: `Mostly like ${name}` },
    { value: 3, label: `Somewhat like ${name}` },
    { value: 4, label: `Mostly not like ${name}` },
    { value: 5, label: `Not like ${name} at all` },
    { value: 0, label: "Can't tell" },
  ];
}
