// How statements about a rated person refer to them after the first mention.
// The person chooses once ("How should the statements about you read?"); the
// default is "they". Templates mark each reference to the rated person with a
// placeholder ({they}, {their}, ...) and each verb after {they} with both
// forms, {v:plural|singular}, so "{they} {v:feel|feels}" becomes "they feel",
// "he feels" or "she feels". Pronouns about other people in a statement are
// plain words and never change. No file access here, so pages can use it too.

export type Pronoun = "they" | "he" | "she";
export const PRONOUNS: Pronoun[] = ["he", "she", "they"];
export const DEFAULT_PRONOUN: Pronoun = "they";

export function isPronoun(v: unknown): v is Pronoun {
  return v === "they" || v === "he" || v === "she";
}

const FORMS: Record<Pronoun, Record<string, string>> = {
  they: {
    they: "they", their: "their", them: "them", themselves: "themselves", theirs: "theirs",
    "they're": "they're", "they've": "they've", "they'd": "they'd", "they'll": "they'll",
  },
  he: {
    they: "he", their: "his", them: "him", themselves: "himself", theirs: "his",
    "they're": "he's", "they've": "he's", "they'd": "he'd", "they'll": "he'll",
  },
  she: {
    they: "she", their: "her", them: "her", themselves: "herself", theirs: "hers",
    "they're": "she's", "they've": "she's", "they'd": "she'd", "they'll": "she'll",
  },
};

// The name used inside statements: the first word of the display name, so
// "Albhy Galuten" reads "Albhy rarely notices...".
export function itemName(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0] ?? "";
  return first || "this person";
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function renderItem(template: string, name: string, pronoun: Pronoun = DEFAULT_PRONOUN): string {
  const forms = FORMS[pronoun];
  const out = template
    .replaceAll("{name}", name)
    .replace(/\{v:([^|}]+)\|([^}]+)\}/g, (_, plural: string, single: string) =>
      pronoun === "they" ? plural : single
    )
    .replace(/\{([A-Za-z']+)\}/g, (whole, word: string) => {
      const form = forms[word.toLowerCase()];
      if (!form) return whole;
      return word.charAt(0) === word.charAt(0).toUpperCase() ? capitalize(form) : form;
    });
  // Templates can start with {name}; a lowercase fallback name ("this person")
  // still needs a capital at the start of the sentence.
  return capitalize(out);
}

// The example sentences on the picker: the choice is made by how a statement
// reads, not by naming pronouns.
export const EXAMPLE_TEMPLATE = "{name} treats {their} calendar as a commitment to {themselves}.";
