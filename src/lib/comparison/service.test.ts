import { test } from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  INVITE_EXPIRY_DAYS,
  MAX_INVITES_PER_DAY,
  createComparison,
  getView,
  hasOwnResult,
  listForUser,
  respond,
  revoke,
  type Actor,
} from "./service";

// A small in-memory stand-in for the Supabase query builder, covering only the
// calls service.ts makes. Enough to check who can see what, and when.
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

const scores = (n: number) => ({
  social_attunement: n,
  empathy: n,
  self_orientation: n,
  conscientiousness: n,
  agency: n,
  reactivity: n,
});

function world() {
  const albhy: Actor = { id: "u-albhy", email: "albhy@example.com" };
  const mel: Actor = { id: "u-mel", email: "mel@example.com" };
  const stranger: Actor = { id: "u-x", email: "x@example.com" };
  const tables: Record<string, Row[]> = {
    people: [
      { id: "p-albhy", owner_user_id: albhy.id, is_self: true, name: "Albhy" },
      { id: "p-mel", owner_user_id: mel.id, is_self: true, name: "Melanie" },
      { id: "p-x", owner_user_id: stranger.id, is_self: true, name: "X" },
    ],
    quiz_results: [{ id: 101, person_id: "p-albhy", scores: scores(3), taken_at: "2026-10-01" }],
    comparisons: [],
    comparison_participants: [],
    comparison_invite_log: [],
  };
  return { db: fakeDb(tables), tables, albhy, mel, stranger };
}

test("an invitee sees only the invitation until they take the assessment and accept", async () => {
  const { db, tables, albhy, mel, stranger } = world();

  const created = await createComparison(db, albhy, "Mel@Example.com ");
  assert.equal(created.ok, true);
  const id = (created as { id: string }).id;

  const melList = await listForUser(db, mel);
  assert.equal(melList.length, 1);
  assert.equal(melList[0].needsMyResponse, true);
  assert.equal(melList[0].canView, false);
  assert.equal(melList[0].other.name, "Albhy");

  // Nothing is visible to anyone yet.
  assert.deepEqual(await getView(db, albhy, id), { state: "pending" });
  assert.equal(await getView(db, mel, id), null);

  // Melanie has no result yet, so she cannot accept.
  assert.equal(await hasOwnResult(db, mel.id), false);
  const early = await respond(db, mel, id, "accept");
  assert.equal(early.ok, false);

  tables.quiz_results.push({ id: 202, person_id: "p-mel", scores: scores(8), taken_at: "2026-10-19" });
  assert.equal(await hasOwnResult(db, mel.id), true);
  assert.equal((await respond(db, mel, id, "accept")).ok, true);

  const albhyView = await getView(db, albhy, id);
  assert.equal(albhyView?.state, "active");
  if (albhyView?.state === "active") {
    assert.equal(albhyView.me.name, "Albhy");
    assert.equal(albhyView.other.name, "Melanie");
    assert.equal(albhyView.other.scores.empathy, 8);
  }
  assert.equal((await getView(db, mel, id))?.state, "active");

  // Someone outside the comparison gets nothing, not even confirmation it exists.
  assert.equal(await getView(db, stranger, id), null);
  assert.equal((await respond(db, stranger, id, "accept")).ok, false);
  assert.equal((await revoke(db, stranger, id)).ok, false);
});

test("either person can end it, and it disappears for both", async () => {
  const { db, tables, albhy, mel } = world();
  tables.quiz_results.push({ id: 202, person_id: "p-mel", scores: scores(8), taken_at: "2026-10-19" });
  const id = ((await createComparison(db, albhy, mel.email)) as { id: string }).id;
  await respond(db, mel, id, "accept");

  assert.equal((await revoke(db, mel, id)).ok, true);
  assert.equal(await getView(db, albhy, id), null);
  assert.equal(await getView(db, mel, id), null);
  // The record is deleted, not just marked ended. Both results remain.
  assert.equal(tables.comparisons.length, 0);
  assert.equal(tables.comparison_participants.length, 0);
  assert.equal(tables.quiz_results.length, 2);
});

test("declining deletes the invitation, including the invited email", async () => {
  const { db, tables, albhy, mel } = world();
  const id = ((await createComparison(db, albhy, mel.email)) as { id: string }).id;
  assert.equal((await respond(db, mel, id, "decline")).ok, true);
  assert.equal(await getView(db, albhy, id), null);
  assert.equal(await getView(db, mel, id), null);
  assert.equal(tables.comparisons.length, 0);
  assert.equal(tables.comparison_participants.length, 0);
  assert.equal((await listForUser(db, albhy)).length, 0);
});

test("an invitation unanswered for 30 days is deleted", async () => {
  const { db, tables, albhy, mel } = world();
  const id = ((await createComparison(db, albhy, mel.email)) as { id: string }).id;
  const old = new Date(Date.now() - (INVITE_EXPIRY_DAYS + 1) * 24 * 60 * 60 * 1000).toISOString();
  tables.comparisons.find((c) => c.id === id)!.created_at = old;
  assert.equal((await listForUser(db, mel)).length, 0);
  assert.equal(tables.comparisons.length, 0);
  assert.equal(tables.comparison_participants.length, 0);
});

test("ending invitations does not free up the daily cap", async () => {
  const { db, albhy } = world();
  for (let i = 0; i < MAX_INVITES_PER_DAY; i++) {
    const id = ((await createComparison(db, albhy, `f${i}@example.com`)) as { id: string }).id;
    assert.equal((await revoke(db, albhy, id)).ok, true);
  }
  const capped = await createComparison(db, albhy, "more@example.com");
  assert.equal(capped.ok === false && capped.status, 429);
});

test("invitations are refused without a result, to yourself, twice, or past the daily cap", async () => {
  const { db, albhy, mel } = world();
  assert.equal((await createComparison(db, mel, albhy.email)).ok, false); // Mel has no result
  assert.equal((await createComparison(db, albhy, albhy.email)).ok, false);
  assert.equal((await createComparison(db, albhy, mel.email)).ok, true);
  const again = await createComparison(db, albhy, mel.email);
  assert.equal(again.ok === false && again.status, 409);

  for (let i = 1; i < MAX_INVITES_PER_DAY; i++) {
    assert.equal((await createComparison(db, albhy, `friend${i}@example.com`)).ok, true);
  }
  const capped = await createComparison(db, albhy, "one-too-many@example.com");
  assert.equal(capped.ok === false && capped.status, 429);
});
