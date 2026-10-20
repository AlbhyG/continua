// The optional personal note an inviter can add to a comparison invitation.
//
// The note goes into an email sent from continua.info to an address the
// inviter typed, so it is kept short, plain text, and free of links and email
// addresses: that makes it useless for phishing or spam while still letting a
// real person say "Hi Mel, this is the book thing I mentioned." It is sent in
// the email only and is not stored.

export const INVITE_NOTE_MAX = 300;

// http(s)://, www., or anything shaped like a domain ("example.com",
// "bit.ly/x"), which also catches email addresses. Ordinary sentences like
// "Mt. Madonna" or "e.g." don't match: they have a space or a one-letter part.
const LINK_LIKE = /(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,}(?=[\/\s.,;:!?)"']|$))/i;

export type NoteResult = { ok: true; note: string | null } | { ok: false; error: string };

export function cleanInviteNote(raw: unknown): NoteResult {
  if (raw === undefined || raw === null) return { ok: true, note: null };
  if (typeof raw !== "string") return { ok: false, error: "The note must be text." };

  const note = raw
    .replace(/\r\n?/g, "\n")
    // Drop control characters other than newline and tab.
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!note) return { ok: true, note: null };
  if (note.length > INVITE_NOTE_MAX) {
    return { ok: false, error: `Please keep the note to ${INVITE_NOTE_MAX} characters.` };
  }
  if (LINK_LIKE.test(note)) {
    return { ok: false, error: "The note can't include links or email addresses." };
  }
  return { ok: true, note };
}
