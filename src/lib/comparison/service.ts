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

// Whether the user has taken an assessment of their own yet. An invitee who
// hasn't is asked to take it first, so they see their own result before deciding.
// How many results the user has of their own (for "compare your assessments").
export async function countOwnResults(db: Db, userId: string): Promise<number> {
  const { data: self } = await db
    .from("people")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("is_self", true)
    .maybeSingle();
  if (!self) return 0;
  const { count } = await db
    .from("quiz_results")
    .select("id", { count: "exact", head: true })
    .eq("person_id", self.id);
  return count ?? 0;
}

export async function hasOwnResult(db: Db, userId: string): Promise<boolean> {
  return (await latestOwnResultId(db, userId)) !== null;
}

export const MAX_INVITES_PER_DAY = 10;
// Unanswered invitations are deleted after this many days.
export const INVITE_EXPIRY_DAYS = 30;

// Ending, declining, or letting an invitation expire deletes the comparison
// and its participant rows (invited email, responses, which result each
// person compared). Nothing about it is kept afterward.
async function deleteComparison(db: Db, comparisonId: string): Promise<void> {
  await db.from("comparison_participants").delete().eq("comparison_id", comparisonId);
  await db.from("comparisons").delete().eq("id", comparisonId);
}

// Deletes invitations left unanswered past INVITE_EXPIRY_DAYS, and invite-cap
// entries older than a day. A daily database job does the same (migration
// 00027); running it here as well keeps things tidy if that job is missing.
export async function purgeExpired(db: Db): Promise<void> {
  const cutoff = new Date(Date.now() - INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: stale } = await db
    .from("comparisons")
    .select("id")
    .eq("status", "pending")
    .lt("created_at", cutoff);
  for (const c of stale ?? []) await deleteComparison(db, c.id as string);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await db.from("comparison_invite_log").delete().lt("sent_at", dayAgo);
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

  await purgeExpired(db);

  // Invitations send email, so cap how many one account can send in a day.
  // Counted from a separate log (account id and time only), because ended and
  // declined comparisons are deleted and would otherwise free up the cap.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recent } = await db
    .from("comparison_invite_log")
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", actor.id)
    .gte("sent_at", since);
  if ((recent ?? 0) >= MAX_INVITES_PER_DAY) {
    return fail(429, "You have sent the most invitations allowed in a day. Please try again tomorrow.");
  }

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
    await deleteComparison(db, created.id);
    return fail(500, "Could not create the comparison.");
  }
  await db.from("comparison_invite_log").insert({ user_id: actor.id, sent_at: now });
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
  await purgeExpired(db);
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

  if (action === "decline") {
    await deleteComparison(db, comparisonId);
    return { ok: true };
  }

  const now = new Date().toISOString();

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
// deleted, so it is gone for both sides immediately.
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
  await deleteComparison(db, comparisonId);
  return { ok: true };
}

export type ComparisonView =
  | { state: "active"; me: PersonView; other: PersonView; comparison: Comparison }
  | {
      state: "unavailable";
      // Which side has no assessment left (every result was deleted).
      mineMissing: boolean;
      theirsMissing: boolean;
    }
  | { state: "pending" | "declined" | "revoked" };
type PersonView = { name: string; scores: AxisScores; takenAt: string };

// The most recent complete result for a user, used for comparisons. Newer
// assessments show up automatically; if one is deleted, the next most recent
// one is used.
async function latestCompleteResult(
  db: Db,
  userId: string | null
): Promise<{ scores: AxisScores; taken_at: string } | null> {
  if (!userId) return null;
  const { data: self } = await db
    .from("people")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("is_self", true)
    .maybeSingle();
  if (!self) return null;
  const { data } = await db
    .from("quiz_results")
    .select("id, scores, taken_at")
    .eq("person_id", self.id)
    .order("taken_at", { ascending: false })
    .limit(20);
  const row = (data ?? []).find((r) => hasAllAxes(r.scores));
  return row ? { scores: row.scores as AxisScores, taken_at: row.taken_at as string } : null;
}

// Only an accepted participant can view a comparison, and only while it is active.
// Returns null (shown as 404) for anyone else, without saying whether it exists.
// Each side shows that person's most recent assessment.
export async function getView(
  db: Db,
  actor: Actor,
  comparisonId: string
): Promise<ComparisonView | null> {
  const { data: mePart } = await db
    .from("comparison_participants")
    .select("comparison_id, invited_email, user_id")
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
    .select("invited_email, user_id, response")
    .eq("comparison_id", comparisonId);
  const otherPart = (parts ?? []).find(
    (p) => p.user_id !== actor.id && p.response === "accepted"
  );

  const mine = await latestCompleteResult(db, actor.id);
  const theirs = otherPart ? await latestCompleteResult(db, otherPart.user_id) : null;
  if (!otherPart || !mine || !theirs) {
    return { state: "unavailable", mineMissing: !mine, theirsMissing: !theirs };
  }

  return {
    state: "active",
    me: {
      name: await displayNameFor(db, actor.id, actor.email),
      scores: mine.scores,
      takenAt: mine.taken_at,
    },
    other: {
      name: await displayNameFor(db, otherPart.user_id, otherPart.invited_email),
      scores: theirs.scores,
      takenAt: theirs.taken_at,
    },
    comparison: compareProfiles(mine.scores, theirs.scores),
  };
}
