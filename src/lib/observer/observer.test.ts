import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fakeDb, type Row } from "../test-support/fake-db";
import type { Actor } from "../comparison/service";
import { hashShareToken } from "../quiz/share";
import { getAllQuestionnaires } from "../quiz/questionnaires";
import { itemName, observerQuestions, renderItem } from "./items";
import { scoreObserverAnswers, CANT_TELL } from "./scoring";
import { buildOthersView, observationsFor, type RatingInput } from "./view";
import {
  MAX_INVITES_PER_DAY,
  createInvite,
  deleteAnonymous,
  deleteForSubject,
  getForRater,
  submitRating,
  summaryForSubject,
  withdrawByToken,
} from "./service";

const scores = (n: number) => ({
  social_attunement: n,
  empathy: n,
  self_orientation: n,
  conscientiousness: n,
  agency: n,
  reactivity: n,
});
const zero = { ...scores(0) };

// ---------------------------------------------------------------------------
// Items

test("every questionnaire item has a third-person version with no first person left", () => {
  const items = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "observer-items", "observer-items.json"), "utf-8")
  ) as Record<string, string>;
  for (const q of getAllQuestionnaires()) {
    q.questions.forEach((_, i) => {
      const t = items[`${q.id}:${i}`];
      assert.ok(t, `missing ${q.id}:${i}`);
      assert.ok(t.includes("{name}"), `${q.id}:${i} never names the person`);
      assert.doesNotMatch(t, /\b(I|me|my|mine|myself)\b/, `${q.id}:${i}: ${t}`);
    });
  }
});

test("items use the first name and keep each item's direction", () => {
  const q = getAllQuestionnaires()[0];
  const rendered = observerQuestions(q.id, "Albhy Galuten");
  assert.ok(rendered);
  assert.equal(rendered.length, q.questions.length);
  assert.match(rendered[0].text, /^Albhy /);
  assert.doesNotMatch(rendered.map((r) => r.text).join(" "), /Galuten|\{name\}/);
  rendered.forEach((r, i) => assert.equal(r.direction, q.questions[i].direction));
  assert.equal(itemName("  "), "this person");
  assert.equal(renderItem("{name} rarely notices.", "this person"), "This person rarely notices.");
});

// ---------------------------------------------------------------------------
// Scoring

test("Can't tell is left out of the score, and an axis needs two answers", () => {
  const questions = [
    { direction: "agentic" },
    { direction: "agentic" },
    { direction: "yielding" },
    { direction: "empathy" },
    { direction: "high-reactive" },
    { direction: "low-reactive" },
  ];
  // agentic agree fully (1) twice, yielding "not at all" (5): all toward Agentic.
  const { scores: s, answered, cantTell } = scoreObserverAnswers([1, 1, 5, 1, CANT_TELL, CANT_TELL], questions);
  assert.equal(s.agency, 10);
  assert.equal(s.empathy, null, "one answer is not enough to score an axis");
  assert.equal(s.reactivity, null);
  assert.equal(answered.agency, 3);
  assert.equal(cantTell.reactivity, 2);
});

// ---------------------------------------------------------------------------
// View: anonymity rules and observations

const rating = (id: string, named: boolean, n: number, name: string | null = null): RatingInput => ({
  id,
  isNamed: named,
  raterName: named ? name ?? id : null,
  email: named ? `${id}@example.com` : null,
  relationship: "friend",
  scores: scores(n),
  cantTellShare: { ...zero },
});

test("a single anonymous rating is held back from everything shown", () => {
  const v = buildOthersView(scores(5), [rating("carol", true, 6), rating("anon1", false, 9)]);
  assert.equal(v.anonymousHeldBack, 1);
  assert.equal(v.anonymousShown, 0);
  for (const a of v.axes) {
    assert.equal(a.anonymousAverage, null);
    assert.equal(a.high, 6, "the anonymous 9 must not show up in the range");
    assert.equal(a.othersAverage, 6);
    assert.equal(a.count, 1);
  }
});

test("two anonymous ratings appear only as an average and in the range", () => {
  const v = buildOthersView(scores(5), [rating("carol", true, 6), rating("a1", false, 9), rating("a2", false, 7)]);
  assert.equal(v.anonymousShown, 2);
  assert.equal(v.named.length, 1);
  assert.equal(v.named[0].email, "carol@example.com");
  const a = v.axes[0];
  assert.equal(a.anonymousAverage, 8);
  assert.deepEqual(a.named, [{ id: "carol", value: 6 }]);
  assert.equal(a.low, 6);
  assert.equal(a.high, 9);
  assert.equal(a.othersAverage, 7.3);
});

test("observations name the pole others place you toward, largest first", () => {
  const self = { ...scores(5), agency: 3, reactivity: 9 };
  const v = buildOthersView(self, [rating("a", true, 5), rating("b", true, 6)]);
  const gaps = v.observations.filter((o) => o.kind === "gap");
  assert.equal(gaps[0].axis, "reactivity");
  assert.match(gaps[0].text, /further toward Calm on Reactivity/);
  assert.match(gaps[1].text, /further toward Agentic on Agency/);
  assert.equal(observationsFor(v.axes.map((x) => ({ ...x, othersAverage: x.self }))).length, 0);
});

test("a wide spread between raters is mentioned as different sides of a range", () => {
  const v = buildOthersView(scores(5), [rating("a", true, 2), rating("b", true, 8)]);
  const spread = v.observations.filter((o) => o.kind === "spread");
  assert.ok(spread.length > 0);
  assert.match(spread[0].text, /different parts of your range/);
});

// ---------------------------------------------------------------------------
// Service: who can do what

function world() {
  const albhy: Actor = { id: "u-albhy", email: "albhy@example.com" };
  const other: Actor = { id: "u-other", email: "other@example.com" };
  const q = getAllQuestionnaires()[0];
  const tables: Record<string, Row[]> = {
    people: [
      { id: "p-albhy", owner_user_id: albhy.id, is_self: true, name: "Albhy Galuten" },
      { id: "p-other", owner_user_id: other.id, is_self: true, name: "Other" },
    ],
    quiz_results: [
      {
        id: 1,
        person_id: "p-albhy",
        questionnaire_id: q.id,
        scores: scores(5),
        taken_at: "2026-10-01T00:00:00Z",
      },
    ],
    observer_ratings: [],
    observer_invite_log: [],
  };
  return { db: fakeDb(tables), tables, albhy, other, q };
}

const answersFor = (n: number, value: number) => Array.from({ length: n }, () => value);

test("the subject must have taken the assessment and can't invite themselves", async () => {
  const { db, albhy, other } = world();
  assert.equal((await createInvite(db, albhy, "ALBHY@example.com")).ok, false);
  const r = await createInvite(db, other, "friend@example.com");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /Take the assessment/);
});

test("only a hash of the rater's token is stored", async () => {
  const { db, albhy, tables } = world();
  const r = await createInvite(db, albhy, "Carol@Example.com ");
  assert.ok(r.ok);
  if (!r.ok) return;
  const row = tables.observer_ratings[0];
  assert.equal(row.token_hash, hashShareToken(r.token));
  assert.ok(!JSON.stringify(row).includes(r.token));
  assert.equal(row.invited_email, "carol@example.com");
});

test("invitations are capped per day and not duplicated while open", async () => {
  const { db, albhy } = world();
  assert.ok((await createInvite(db, albhy, "carol@example.com")).ok);
  const dup = await createInvite(db, albhy, "carol@example.com");
  assert.equal(dup.ok, false);
  for (let i = 1; i < MAX_INVITES_PER_DAY; i++) assert.ok((await createInvite(db, albhy, `p${i}@example.com`)).ok);
  const capped = await createInvite(db, albhy, "one-more@example.com");
  assert.equal(capped.ok, false);
  if (!capped.ok) assert.equal(capped.status, 429);
});

test("a rater sees the items for the subject's name, never their email", async () => {
  const { db, albhy, q } = world();
  const r = await createInvite(db, albhy, "carol@example.com");
  if (!r.ok) throw new Error("invite failed");
  const view = await getForRater(db, r.token);
  assert.ok(view && view.state === "open");
  if (!view || view.state !== "open") return;
  assert.equal(view.subjectName, "Albhy Galuten");
  assert.equal(view.questions.length, q.questions.length);
  assert.match(view.questions[0].text, /Albhy/);
  assert.ok(!JSON.stringify(view).includes(albhy.email));
  assert.equal(await getForRater(db, "not-a-real-token-at-all-xxxxxxxx"), null);
});

test("an anonymous submission keeps no email, and answers once", async () => {
  const { db, albhy, tables, q } = world();
  const r = await createInvite(db, albhy, "carol@example.com");
  if (!r.ok) throw new Error("invite failed");
  const body = {
    answers: answersFor(q.questions.length, 2),
    named: false, initialNamed: true,
    raterName: "Carol",
    relationship: "friend",
    knownFor: "5_to_15",
    researchConsent: true,
  };
  assert.deepEqual(await submitRating(db, r.token, body), { ok: true });
  const row = tables.observer_ratings[0];
  assert.equal(row.invited_email, null);
  assert.equal(row.rater_name, null, "a name typed before choosing anonymous is dropped");
  assert.equal(row.research_consent, true);
  assert.equal(row.initial_is_named, true, "the first-screen choice is kept for research");
  const again = await submitRating(db, r.token, body);
  assert.equal(again.ok, false);
  assert.deepEqual(await getForRater(db, r.token), { state: "completed", subjectName: "Albhy Galuten" });
});

test("submissions are validated", async () => {
  const { db, albhy, q } = world();
  const r = await createInvite(db, albhy, "carol@example.com");
  if (!r.ok) throw new Error("invite failed");
  const ok = {
    answers: answersFor(q.questions.length, 3),
    named: true, initialNamed: true,
    raterName: "Carol",
    relationship: "friend",
    knownFor: "1_to_5",
    researchConsent: false,
  };
  const bad = [
    { ...ok, answers: answersFor(q.questions.length - 1, 3) },
    { ...ok, answers: answersFor(q.questions.length, 6) },
    { ...ok, answers: answersFor(q.questions.length, CANT_TELL) },
    { ...ok, named: "yes" },
    { ...ok, initialNamed: undefined },
    { ...ok, raterName: "   " },
    { ...ok, raterName: "x".repeat(61) },
    { ...ok, relationship: "enemy" },
    { ...ok, knownFor: "forever" },
  ];
  for (const b of bad) assert.equal((await submitRating(db, r.token, b)).ok, false, JSON.stringify(b).slice(0, 80));
  assert.deepEqual(await submitRating(db, r.token, ok), { ok: true });
});

test("the subject sees named raters and held-back anonymous ones, never answers", async () => {
  const { db, albhy, other, q } = world();
  const base = { relationship: "friend", knownFor: "over_15", researchConsent: false };
  const mk = async (email: string) => {
    const r = await createInvite(db, albhy, email);
    if (!r.ok) throw new Error("invite failed");
    return r.token;
  };
  const carol = await mk("carol@example.com");
  const anon1 = await mk("dan@example.com");
  await mk("erin@example.com");
  await submitRating(db, carol, { ...base, answers: answersFor(q.questions.length, 1), named: true, initialNamed: true, raterName: "Carol" });
  await submitRating(db, anon1, { ...base, answers: answersFor(q.questions.length, 5), named: false, initialNamed: true, raterName: null });

  const s = await summaryForSubject(db, albhy);
  assert.deepEqual(
    s.pending.map((p) => p.email),
    ["erin@example.com"],
    "the anonymous rater's address disappears from the list"
  );
  assert.equal(s.view.named.length, 1);
  assert.equal(s.view.named[0].name, "Carol");
  assert.equal(s.view.anonymousHeldBack, 1);
  const json = JSON.stringify(s);
  assert.ok(!json.includes("dan@example.com"));
  assert.ok(!json.includes('"answers"'));
  assert.ok(s.self);

  // Someone else sees nothing of Albhy's.
  const theirs = await summaryForSubject(db, other);
  assert.equal(theirs.pending.length, 0);
  assert.equal(theirs.view.named.length, 0);
  assert.equal(theirs.view.anonymousHeldBack, 0);
});

test("deleting: subject by id (not anonymous ones), anonymous all together, rater by link", async () => {
  const { db, albhy, other, tables, q } = world();
  const base = { relationship: "friend", knownFor: "over_15", researchConsent: false };
  const a = await createInvite(db, albhy, "a@example.com");
  const b = await createInvite(db, albhy, "b@example.com");
  const c = await createInvite(db, albhy, "c@example.com");
  if (!a.ok || !b.ok || !c.ok) throw new Error("invite failed");
  await submitRating(db, a.token, { ...base, answers: answersFor(q.questions.length, 2), named: true, initialNamed: true, raterName: "A" });
  await submitRating(db, b.token, { ...base, answers: answersFor(q.questions.length, 2), named: false, initialNamed: true, raterName: null });

  assert.equal((await deleteForSubject(db, other, a.id)).ok, false, "only the subject can delete");
  assert.equal((await deleteForSubject(db, albhy, b.id)).ok, false, "anonymous ratings aren't addressable one by one");
  assert.deepEqual(await deleteForSubject(db, albhy, a.id), { ok: true });
  assert.deepEqual(await deleteAnonymous(db, albhy), { ok: true });
  assert.equal(tables.observer_ratings.length, 1);

  assert.deepEqual(await withdrawByToken(db, c.token), { ok: true });
  assert.equal(tables.observer_ratings.length, 0);
  assert.equal((await withdrawByToken(db, c.token)).ok, false);
});
