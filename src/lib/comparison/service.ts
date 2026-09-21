import type { SupabaseClient } from "@supabase/supabase-js";
import type { AxisScores } from "@/lib/quiz/scoring";
import { AXIS_ORDER, compareProfiles, type Comparison } from "./compare";

// Server-side logic for two-person comparisons. Every function takes the
// service-role client and the signed-in user's id and email, and enforces who
// may do what. There is no administrative read path: only accepted participants
// can ever see a comparison's scores.

type Db = SupabaseClient;
export type Actor = { id: string; email: string };

export const normEmail = (email: string) => email.trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

type Fail = { ok: false; status: number; error: string };
const fail = (status: number, error: string): Fail => ({ ok: false, status, error });

export async function displayNameFor(
  db: Db,
  userId: string | null,
  email: string
): Promise<string> {
  const fallback = email.split("@")[0] || "Someone";
  if (!userId) return fallback;
  const { data } = await db
    .from("people")
    .select("name")
    .eq("owner_user_id", userId)
    .eq("is_self", true)
    .maybeSingle();
  const name = typeof data?.name === "string" ? data.name.trim() : "";
  return name || fallback;
}

// The user's own most recent result (the one recorded for their own "self" person).
async function latestOwnResultId(db: Db, userId: string): Promise<number | null> {
  const { data: self } = await db
    .from("people")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("is_self", true)
    .maybeSingle();
  if (!self) return null;
  const { data } = await db
    .from("quiz_results")
    .select("id")
    .eq("person_id", self.id)
    .order("taken_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

function hasAllAxes(scores: unknown): scores is AxisScores {
  if (!scores || typeof scores !== "object") return false;
  return AXIS_ORDER.every((k) => Number.isFinite((scores as Record<string, unknown>)[k]));
}

export async function createComparison(
  db: Db,
  actor: Actor,
  inviteeEmailRaw: string
): Promise<{ ok: true; id: string } | Fail> {
  const invitee = normEmail(inviteeEmailRaw || "");
  const me = normEmail(actor.email);
  if (!EMAIL_RE.test(invitee) || invitee.length > 254) {
    return fail(400, "Enter a valid email address.");
  }
  if (invitee === me) return fail(400, "You cannot compare with yourself.");

  const resultId = await latestOwnResultId(db, actor.id);
  if (!resultId) return fail(400, "Take an assessment first, then invite someone.");

  // One open comparison per pair at a time.
  const { data: mine } = await db
    .from("comparison_participants")
    .select("comparison_id")
    .eq("user_id", actor.id);
  const { data: theirs } = await db
    .from("comparison_participants")
    .select("comparison_id")
    .eq("invited_email", invitee);
  const shared = new Set((theirs ?? []).map((r) => r.comparison_id));
  const candidateIds = (mine ?? []).map((r) => r.comparison_id).filter((id) => shared.has(id));
  if (candidateIds.length > 0) {
    const { data: open } = await db
      .from("comparisons")
      .select("id, status")
      .in("id", candidateIds);
    if ((open ?? []).some((c) => c.status === "pending" || c.status === "active")) {
      return fail(409, "You already have a comparison with this person.");
    }
  }

  const { data: created, error } = await db
    .from("comparisons")
    .insert({ created_by: actor.id, status: "pending" })
    .select("id")
    .single();
  if (error || !created) return fail(500, "Could not create the comparison.");

  const now = new Date().toISOString();
  const { error: partError } = await db.from("comparison_participants").insert([
    {
      comparison_id: created.id,
      invited_email: me,
      user_id: actor.id,
      result_id: resultId,
      response: "accepted",
      responded_at: now,
    },
    { comparison_id: created.id, invited_email: invitee, response: "invited" },
  ]);
  if (partError) {
    await db.from("comparisons").delete().eq("id", created.id);
    return fail(500, "Could not create the comparison.");
  }
  return { ok: true, id: created.id };
}

export type ComparisonSummary = {
  id: string;
  status: "pending" | "active" | "declined" | "revoked";
  iAmInitiator: boolean;
  other: { name: string; email: string };
  needsMyResponse: boolean;
  waitingOnThem: boolean;
  canView: boolean;
  createdAt: string;
};

export async function listForUser(db: Db, actor: Actor): Promise<ComparisonSummary[]> {
  const me = normEmail(actor.email);
  const { data: mine } = await db
    .from("comparison_participants")
    .select("comparison_id")
    .eq("user_id", actor.id);
  const { data: invites } = await db
    .from("comparison_participants")
    .select("comparison_id")
    .eq("invited_email", me);
  const ids = [
    ...new Set([...(mine ?? []), ...(invites ?? [])].map((r) => r.comparison_id as string)),
  ];
  if (ids.length === 0) return [];

  const { data: comparisons } = await db
    .from("comparisons")
    .select("id, status, created_by, created_at")
    .in("id", ids);
  const { data: participants } = await db
    .from("comparison_participants")
    .select("comparison_id, invited_email, user_id, response")
    .in("comparison_id", ids);

  const out: ComparisonSummary[] = [];
  for (const c of comparisons ?? []) {
    const parts = (participants ?? []).filter((p) => p.comparison_id === c.id);
    const mePart = parts.find((p) => p.invited_email === me || p.user_id === actor.id);
    const other = parts.find((p) => p !== mePart);
    if (!mePart || !other) continue;
    out.push({
      id: c.id,
      status: c.status,
      iAmInitiator: c.created_by === actor.id,
      other: {
        name: await displayNameFor(db, other.user_id, other.invited_email),
        email: other.invited_email,
      },
      needsMyResponse: c.status === "pending" && mePart.response === "invited",
      waitingOnThem: c.status === "pending" && mePart.response === "accepted",
      canView: c.status === "active" && mePart.response === "accepted",
      createdAt: c.created_at,
    });
  }
  return out.sort((x, y) => (x.createdAt < y.createdAt ? 1 : -1));
}

export async function respond(
  db: Db,
  actor: Actor,
  comparisonId: string,
  action: "accept" | "decline"
): Promise<{ ok: true } | Fail> {
  const me = normEmail(actor.email);
  const { data: part } = await db
    .from("comparison_participants")
    .select("comparison_id")
    .eq("comparison_id", comparisonId)
    .eq("invited_email", me)
    .eq("response", "invited")
    .maybeSingle();
  if (!part) return fail(404, "Invitation not found.");

  const { data: cmp } = await db
    .from("comparisons")
    .select("id, status")
    .eq("id", comparisonId)
    .maybeSingle();
  if (!cmp || cmp.status !== "pending") return fail(409, "This invitation is no longer open.");

  const now = new Date().toISOString();
  if (action === "decline") {
    await db
      .from("comparison_participants")
      .update({ response: "declined", user_id: actor.id, responded_at: now })
      .eq("comparison_id", comparisonId)
      .eq("invited_email", me);
    await db
      .from("comparisons")
      .update({ status: "declined", ended_at: now, ended_by: actor.id })
      .eq("id", comparisonId);
    return { ok: true };
  }

  const resultId = await latestOwnResultId(db, actor.id);
  if (!resultId) return fail(400, "Take an assessment first, then accept.");
  await db
    .from("comparison_participants")
    .update({ response: "accepted", user_id: actor.id, result_id: resultId, responded_at: now })
    .eq("comparison_id", comparisonId)
    .eq("invited_email", me);

  const { data: all } = await db
    .from("comparison_participants")
    .select("response")
    .eq("comparison_id", comparisonId);
  if ((all ?? []).length > 0 && (all ?? []).every((p) => p.response === "accepted")) {
    await db
      .from("comparisons")
      .update({ status: "active", activated_at: now })
      .eq("id", comparisonId);
  }
  return { ok: true };
}

// Either accepted participant can end a pending or active comparison. It is
// then unavailable to both sides immediately.
export async function revoke(
  db: Db,
  actor: Actor,
  comparisonId: string
): Promise<{ ok: true } | Fail> {
  const { data: part } = await db
    .from("comparison_participants")
    .select("comparison_id")
    .eq("comparison_id", comparisonId)
    .eq("user_id", actor.id)
    .eq("response", "accepted")
    .maybeSingle();
  if (!part) return fail(404, "Comparison not found.");

  const { data: cmp } = await db
    .from("comparisons")
    .select("id, status")
    .eq("id", comparisonId)
    .maybeSingle();
  if (!cmp) return fail(404, "Comparison not found.");
  if (cmp.status !== "pending" && cmp.status !== "active") {
    return fail(409, "This comparison has already ended.");
  }
  await db
    .from("comparisons")
    .update({ status: "revoked", ended_at: new Date().toISOString(), ended_by: actor.id })
    .eq("id", comparisonId);
  return { ok: true };
}

export type ComparisonView =
  | { state: "active"; me: PersonView; other: PersonView; comparison: Comparison }
  | { state: "pending" | "declined" | "revoked" | "unavailable" };
type PersonView = { name: string; scores: AxisScores; takenAt: string };

// Only an accepted participant can view a comparison, and only while it is active.
// Returns null (shown as 404) for anyone else, without saying whether it exists.
export async function getView(
  db: Db,
  actor: Actor,
  comparisonId: string
): Promise<ComparisonView | null> {
  const { data: mePart } = await db
    .from("comparison_participants")
    .select("comparison_id, invited_email, user_id, result_id")
    .eq("comparison_id", comparisonId)
    .eq("user_id", actor.id)
    .eq("response", "accepted")
    .maybeSingle();
  if (!mePart) return null;

  const { data: cmp } = await db
    .from("comparisons")
    .select("id, status")
    .eq("id", comparisonId)
    .maybeSingle();
  if (!cmp) return null;
  if (cmp.status !== "active") {
    return { state: cmp.status as "pending" | "declined" | "revoked" };
  }

  const { data: parts } = await db
    .from("comparison_participants")
    .select("invited_email, user_id, result_id, response")
    .eq("comparison_id", comparisonId);
  const otherPart = (parts ?? []).find(
    (p) => p.user_id !== actor.id && p.response === "accepted"
  );
  if (!otherPart || !mePart.result_id || !otherPart.result_id) {
    return { state: "unavailable" };
  }

  const { data: results } = await db
    .from("quiz_results")
    .select("id, scores, taken_at")
    .in("id", [mePart.result_id, otherPart.result_id]);
  const mineRow = (results ?? []).find((r) => r.id === mePart.result_id);
  const theirRow = (results ?? []).find((r) => r.id === otherPart.result_id);
  if (!mineRow || !theirRow || !hasAllAxes(mineRow.scores) || !hasAllAxes(theirRow.scores)) {
    return { state: "unavailable" };
  }

  return {
    state: "active",
    me: {
      name: await displayNameFor(db, actor.id, actor.email),
      scores: mineRow.scores,
      takenAt: mineRow.taken_at,
    },
    other: {
      name: await displayNameFor(db, otherPart.user_id, otherPart.invited_email),
      scores: theirRow.scores,
      takenAt: theirRow.taken_at,
    },
    comparison: compareProfiles(mineRow.scores, theirRow.scores),
  };
}
