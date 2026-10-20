import { test } from "node:test";
import assert from "node:assert/strict";
import { INVITE_NOTE_MAX, cleanInviteNote } from "./invite-note";

test("no note is fine", () => {
  assert.deepEqual(cleanInviteNote(undefined), { ok: true, note: null });
  assert.deepEqual(cleanInviteNote(null), { ok: true, note: null });
  assert.deepEqual(cleanInviteNote("   \n  "), { ok: true, note: null });
});

test("ordinary notes pass, trimmed", () => {
  assert.deepEqual(cleanInviteNote("  Hi Mel, humor me!  "), { ok: true, note: "Hi Mel, humor me!" });
  for (const text of [
    "See you at Mt. Madonna this weekend.",
    "It's quick, e.g. ten minutes.",
    "Love, Dad.",
    "Answer honestly... I mean it.",
  ]) {
    assert.equal(cleanInviteNote(text).ok, true, text);
  }
});

test("blank-line runs collapse and control characters go", () => {
  assert.deepEqual(cleanInviteNote("Hi\r\n\r\n\r\n\r\nthere\u0007"), { ok: true, note: "Hi\n\nthere" });
});

test("links and email addresses are refused", () => {
  for (const text of [
    "go to https://evil.example",
    "http://x.y",
    "visit www.something",
    "bit.ly/abc",
    "check example.com today",
    "ends with example.com",
    "write me at someone@gmail.com",
    "Click (paypal.com) now",
  ]) {
    const result = cleanInviteNote(text);
    assert.equal(result.ok, false, text);
  }
});

test("too long is refused, the limit itself is fine", () => {
  assert.equal(cleanInviteNote("a".repeat(INVITE_NOTE_MAX)).ok, true);
  assert.equal(cleanInviteNote("a".repeat(INVITE_NOTE_MAX + 1)).ok, false);
});

test("non-text is refused", () => {
  assert.equal(cleanInviteNote(42).ok, false);
  assert.equal(cleanInviteNote({ note: "hi" }).ok, false);
});
