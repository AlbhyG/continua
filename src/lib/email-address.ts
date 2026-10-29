// Cleans an email address the way people actually type or paste it: trims
// spaces, lowercases, and drops punctuation that comes along when an address
// is copied out of a sentence (a trailing period or comma, surrounding quotes
// or angle brackets).
export function cleanEmail(raw: string): string {
  return raw.trim().replace(/^[<"'(\[]+|[>"')\].,;:]+$/g, "").toLowerCase();
}
