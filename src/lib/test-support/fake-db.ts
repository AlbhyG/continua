import type { SupabaseClient } from "@supabase/supabase-js";

// A small in-memory stand-in for the Supabase query builder, covering only the
// calls the service modules make. Enough to check who can see what, and when.
export type Row = Record<string, unknown>;
type Filter = (r: Row) => boolean;

export function fakeDb(tables: Record<string, Row[]>) {
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
