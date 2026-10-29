import { test } from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllQuestionnaires } from "../quiz/questionnaires";
import type { Questionnaire } from "../quiz/scoring";
import { hasRaterVersion, raterText, renderTemplate } from "./questions";
import { scoreRating } from "./score";
import {
  MIN_ANONYMOUS,
  createRatingInvite,
  raterView,
  ratingForm,
  removeNamed,
  subjectView,
  submitRating,
  summarize,
  withdraw,
} from "./service";
import type { Actor } from "../comparison/service";

type Row = Record<string, unknown>;
type Filter = (r: Row) => boolean;

function fakeDb(tables: Record<string, Row[]>) {
  let nextId = 1;
  const db = {
    from(table: string) {
      const rows = (tables[table] ??= []);
      const filters: Filter[] = [];
      let mode: "select" | "update" | "delete" | "insert" = "select";
      let patch: Row = {};
      let inserted: Row[] = [];
      let countHead = false;
      let order: { col: string; asc: boolean } | null = null;
      let limit: number | null = null;
      const matching = () => {
        let out = rows.filter((r) => filters.every((f) => f(r)));
        if (order) {
          const { col, asc } = order;
          out = [...out].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : 1) * (asc ? 1 : -1));
        }
        return limit == null ? out : out.slice(0, limit);
      };
      const run = () => {
        if (mode === "insert") return { data: inserted, error: null };
        if (mode === "update") {
          matching().forEach((r) => Object.assign(r, patch));
          return { data: null, error: null };
        }
        if (mode === "delete") {
          const doomed = new Set(matching());
          tables[table] = rows.filter((r) => !doomed.has(r));
          return { data: null, error: null };
        }
        const data = matching();
        return countHead ? { data: null, count: data.length, error: null } : { data, error: null };
      };
      const builder = {
        select(_cols?: string, opts?: { count?: string; head?: boolean }) {
          if (mode === "select") countHead = !!opts?.head;
          return builder;
        },
        insert(values: Row | Row[]) {
          mode = "insert";
          inserted = (Array.isArray(values) ? values : [values]).map((v) => ({
            id: v.id ?? (table === "comparisons" ? `c${nextId++}` : nextId++),
            created_at: new Date().toISOString(),
            ...v,
          }));
          rows.push(...inserted);
          return builder;
        },
        update(values: Row) {
          mode = "update";
          patch = values;
          return builder;
        },
        delete() {
          mode = "delete";
          return builder;
        },
        eq(col: string, val: unknown) {
          filters.push((r) => r[col] === val);
          return builder;
        },
        in(col: string, vals: unknown[]) {
          filters.push((r) => vals.includes(r[col]));
          return builder;
        },
        gte(col: string, val: string) {
          filters.push((r) => String(r[col]) >= val);
          return builder;
        },
        or(expr: string) {
          const conds = expr.split(",").map((c) => {
            const [col, , ...rest] = c.split(".");
            return { col, val: rest.join(".") };
          });
          filters.push((r) => conds.some(({ col, val }) => String(r[col]) === val));
          return builder;
        },
        lt(col: string, val: string) {
          filters.push((r) => String(r[col]) < val);
          return builder;
        },
        order(col: string, opts?: { ascending?: boolean }) {
          order = { col, asc: opts?.ascending !== false };
          return builder;
        },
        limit(n: number) {
          limit = n;
          return builder;
        },
        maybeSingle: async () => {
          const r = run();
          return { data: (r.data as Row[] | null)?.[0] ?? null, error: null };
        },
        single: async () => {
          const r = run();
          const first = (r.data as Row[] | null)?.[0] ?? null;
          return { data: first, error: first ? null : { message: "none" } };
        },
        then(resolve: (v: unknown) => void, reject?: (e: unknown) => void) {
          try {
            resolve(run());
          } catch (e) {
            reject?.(e);
          }
        },
      };
      return builder;
    },
  };
  return db as unknown as SupabaseClient;
}


const all = (n: number) => ({
  social_attunement: n, empathy: n, self_orientation: n, conscientiousness: n, agency: n, reactivity: n,
});

test("every question in every questionnaire has a version written about someone else", () => {
  for (const q of getAllQuestionnaires()) {
    for (const item of q.questions) assert.ok(hasRaterVersion(item.text), item.text);
  }
});

test("templates read correctly for he, she and they", () => {
  const t = "When {name} learns that someone {they} {V:knows/know} is struggling, {their} first instinct is to help {them}.";
  assert.equal(renderTemplate(t, "Albhy", "he"), "When Albhy learns that someone he knows is struggling, his first instinct is to help him.");
  assert.equal(renderTemplate(t, "Ana", "she"), "When Ana learns that someone she knows is struggling, her first instinct is to help her.");
  assert.equal(renderTemplate(t, "Sam", "they"), "When Sam learns that someone they know is struggling, their first instinct is to help them.");
  const sample = getAllQuestionnaires()[0].questions[0].text;
  const out = raterText(sample, "Sam", "they");
  assert.ok(out && !/[{}]/.test(out));
});

test("Can't tell is left out of scoring, and an axis with too few answers is blank", () => {
  const q = getAllQuestionnaires()[0];
  const answers = q.questions.map(() => 1);
  const full = scoreRating(answers, q.questions);
  assert.ok(Object.values(full).every((v) => typeof v === "number"));
  // Mark every Empathy question "Can't tell".
  const empathyIdx = q.questions.map((x, i) => (x.direction === "empathy" || x.direction === "detachment" ? i : -1)).filter((i) => i >= 0);
  const some = answers.map((a, i) => (empathyIdx.includes(i) ? 0 : a));
  const partial = scoreRating(some, q.questions);
  assert.equal(partial.empathy, null);
  assert.equal(partial.agency, full.agency);
});

test("the anonymous average enters as one point, so no individual anonymous score shows", () => {
  const { axes } = summarize(all(4), [all(5)], all(8));
  const a = axes[0];
  assert.equal(a.points, 2);
  assert.equal(a.low, 5);
  assert.equal(a.high, 8);
  assert.equal(a.others, 6.5);
  assert.equal(a.gap, 2.5);
  assert.equal(a.agree, false);
  const close = summarize(all(4), [all(5), all(6)], null).axes[0];
  assert.equal(close.agree, true);
});

function world() {
  const me: Actor = { id: "u-me", email: "me@example.com" };
  const mel: Actor = { id: "u-mel", email: "mel@example.com" };
  const jo: Actor = { id: "u-jo", email: "jo@example.com" };
  const kim: Actor = { id: "u-kim", email: "kim@example.com" };
  const tables: Record<string, Row[]> = {
    people: [
      { id: "p-me", owner_user_id: me.id, is_self: true, name: "Albhy", pronoun: "he" },
      { id: "p-mel", owner_user_id: mel.id, is_self: true, name: "Melanie" },
      { id: "p-jo", owner_user_id: jo.id, is_self: true, name: "Jo" },
      { id: "p-kim", owner_user_id: kim.id, is_self: true, name: "Kim" },
    ],
    quiz_results: [{ id: 1, person_id: "p-me", questionnaire_id: 1, scores: all(3), taken_at: "2026-10-01" }],
    ratings: [],
    rating_invite_log: [],
  };
  return { db: fakeDb(tables), tables, me, mel, jo, kim };
}
const q1: Questionnaire = getAllQuestionnaires().find((q) => q.id === 1)!;
const load = (id: number) => (id === 1 ? q1 : undefined);
const ones = () => q1.questions.map(() => 1);

test("only the invited email can see and answer the questions, written about the subject", async () => {
  const { db, me, mel, jo } = world();
  const r = await createRatingInvite(db, me, mel.email);
  assert.equal(r.ok, true);
  const id = (r as { id: string }).id;
  assert.equal((await createRatingInvite(db, me, mel.email)).ok, false);
  assert.equal((await createRatingInvite(db, me, me.email)).ok, false);

  assert.equal((await ratingForm(db, jo, id, load)).ok, false);
  const form = await ratingForm(db, mel, id, load);
  assert.equal(form.ok, true);
  if (form.ok) {
    assert.equal(form.form.subjectName, "Albhy");
    assert.equal(form.form.questions.length, q1.questions.length);
    assert.ok(form.form.questions.every((t) => !t.includes("{") && !/\bI\b/.test(t) || t.includes("people I know") || t.includes("I would expect")));
  }
  assert.equal((await raterView(db, mel)).requests.length, 1);
  assert.equal((await submitRating(db, mel, id, ones(), "named", load)).ok, true);
  assert.equal((await submitRating(db, mel, id, ones(), "named", load)).ok, false);
});

test("anonymous ratings stay hidden until there are enough, and are only ever averaged", async () => {
  const { db, me, mel, jo, kim } = world();
  const ids: Record<string, string> = {};
  for (const p of [mel, jo, kim]) ids[p.id] = ((await createRatingInvite(db, me, p.email)) as { id: string }).id;

  await submitRating(db, mel, ids[mel.id], ones(), "named", load);
  await submitRating(db, jo, ids[jo.id], q1.questions.map(() => 5), "anonymous", load);
  let v = await subjectView(db, me);
  assert.equal(v.named.length, 1);
  assert.equal(v.named[0].name, "Melanie");
  assert.equal(v.anonymous.count, 1);
  assert.equal(v.anonymous.average, null);
  assert.equal(v.axes[0].points, 1);
  // The invitation list doesn't say who has answered.
  assert.equal(v.invited.length, 3);
  assert.ok(v.invited.every((i) => Object.keys(i).sort().join() === "email,invitedAt"));

  await submitRating(db, kim, ids[kim.id], q1.questions.map(() => 3), "anonymous", load);
  v = await subjectView(db, me);
  assert.equal(v.anonymous.count, MIN_ANONYMOUS);
  assert.ok(v.anonymous.average);
  assert.equal(v.axes[0].points, 2);

  // The subject can remove a named rating but not an anonymous one.
  assert.equal((await removeNamed(db, me, ids[jo.id])).ok, false);
  assert.equal((await removeNamed(db, me, ids[mel.id])).ok, true);
  // A rater can withdraw; others can't.
  assert.equal((await withdraw(db, mel, ids[kim.id])).ok, false);
  assert.equal((await withdraw(db, kim, ids[kim.id])).ok, true);
  v = await subjectView(db, me);
  assert.equal(v.anonymous.count, 1);
  assert.equal(v.anonymous.average, null);
});

test("you need your own result before inviting anyone", async () => {
  const { db, mel, jo } = world();
  assert.equal((await createRatingInvite(db, mel, jo.email)).ok, false);
});
