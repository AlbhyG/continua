import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AXIS_ORDER } from "@/lib/comparison/compare";
import { displayNameFor, normEmail, type Actor } from "@/lib/comparison/service";
import { hashShareToken, isWellFormedShareToken } from "@/lib/quiz/share";
import type { AxisScores } from "@/lib/quiz/scoring";
import { observerQuestions } from "./items";
import { CANT_TELL, isValidObserverAnswer, scoreObserverAnswers, type Axis, type ObserverScores } from "./scoring";
import { buildOthersView, type OthersView, type RatingInput, type RelationshipKey } from "./view";

// Server-side logic for "How others see you". Every function takes the
// service-role client and enforces who may do what:
// - Only the subject (signed in) can invite people to rate them, see the
//   result, or delete ratings of them.
// - A rater is identified only by the token in their emailed link. They can
//   answer once, and withdraw later with the same link.
// - The subject never receives item answers, rater emails for anonymous
//   ratings, or anonymous scores while fewer than two exist (view.ts).

type Db = SupabaseClient;
type Fail = { ok: false; status: number; error: string };
const fail = (status: number, error: string): Fail => ({ ok: false, status, error });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_BYTES = 24;

export const MAX_INVITES_PER_DAY = 10;
export const INVITE_EXPIRY_DAYS = 30;
export const RATER_NAME_MAX = 60;

export const RELATIONSHIPS: RelationshipKey[] = ["partner", "family", "friend", "coworker", "other"];
export const KNOWN_FOR = ["under_1", "1_to_5", "5_to_15", "over_15"] as const;
export type KnownFor = (typeof KNOWN_FOR)[number];

export async function purgeExpired(db: Db): Promise<void> {
  const cutoff = new Date(Date.now() - INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await db.from("observer_ratings").delete().eq("status", "invited").lt("created_at", cutoff);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await db.from("observer_invite_log").delete().lt("sent_at", dayAgo);
}

async function latestOwnResult(
  db: Db,
  userId: string
): Promise<{ questionnaire_id: number; scores: unknown; taken_at: string } | null> {
  const { data: self } = await db
    .from("people")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("is_self", true)
    .maybeSingle();
  if (!self) return null;
  const { data } = await db
    .from("quiz_results")
    .select("questionnaire_id, scores, taken_at")
    .eq("person_id", self.id)
    .order("taken_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

function hasAllAxes(scores: unknown): scores is AxisScores {
  if (!scores || typeof scores !== "object") return false;
  return AXIS_ORDER.every((k) => Number.isFinite((scores as Record<string, unknown>)[k]));
}

// ---------------------------------------------------------------------------
// Subject side

export async function createInvite(
  db: Db,
  actor: Actor,
  inviteeEmailRaw: string
): Promise<{ ok: true; id: string; token: string } | Fail> {
  const invitee = normEmail(inviteeEmailRaw || "");
  if (!EMAIL_RE.test(invitee) || invitee.length > 254) return fail(400, "Enter a valid email address.");
  if (invitee === normEmail(actor.email)) return fail(400, "This is for other people's view of you.");

  const latest = await latestOwnResult(db, actor.id);
  if (!latest) return fail(400, "Take the assessment yourself first, then invite people.");

  await purgeExpired(db);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recent } = await db
    .from("observer_invite_log")
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", actor.id)
    .gte("sent_at", since);
  if ((recent ?? 0) >= MAX_INVITES_PER_DAY) {
    return fail(429, "You have sent the most invitations allowed in a day. Please try again tomorrow.");
  }

  const { data: open } = await db
    .from("observer_ratings")
    .select("id")
    .eq("subject_user_id", actor.id)
    .eq("invited_email", invitee)
    .eq("status", "invited");
  if ((open ?? []).length > 0) return fail(409, "You have already invited this person. They haven't answered yet.");

  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const { data: created, error } = await db
    .from("observer_ratings")
    .insert({
      subject_user_id: actor.id,
      questionnaire_id: latest.questionnaire_id,
      token_hash: hashShareToken(token),
      invited_email: invitee,
      status: "invited",
    })
    .select("id")
    .single();
  if (error || !created) return fail(500, "Could not create the invitation.");
  await db.from("observer_invite_log").insert({ user_id: actor.id, sent_at: new Date().toISOString() });
  return { ok: true, id: created.id as string, token };
}

export type SubjectSummary = {
  myName: string;
  self: { scores: AxisScores; takenAt: string } | null;
  pending: { id: string; email: string; createdAt: string }[];
  view: OthersView;
};

type RatingRow = {
  id: string;
  questionnaire_id: number;
  invited_email: string | null;
  status: "invited" | "completed";
  created_at: string;
  is_named: boolean | null;
  rater_name: string | null;
  relationship: RelationshipKey | null;
  answers: number[] | null;
  scores: ObserverScores | null;
};

function cantTellShare(row: RatingRow): Record<Axis, number> {
  const out = Object.fromEntries(AXIS_ORDER.map((a) => [a, 0])) as Record<Axis, number>;
  const questions = observerQuestions(row.questionnaire_id, "x");
  if (!questions || !row.answers || row.answers.length !== questions.length) return out;
  const { answered, cantTell } = scoreObserverAnswers(row.answers, questions);
  for (const a of AXIS_ORDER) {
    const total = answered[a] + cantTell[a];
    out[a] = total ? cantTell[a] / total : 0;
  }
  return out;
}

export async function summaryForSubject(db: Db, actor: Actor): Promise<SubjectSummary> {
  await purgeExpired(db);
  const [latest, myName, { data }] = await Promise.all([
    latestOwnResult(db, actor.id),
    displayNameFor(db, actor.id, actor.email),
    db
      .from("observer_ratings")
      .select(
        "id, questionnaire_id, invited_email, status, created_at, is_named, rater_name, relationship, answers, scores"
      )
      .eq("subject_user_id", actor.id),
  ]);
  const rows = (data ?? []) as RatingRow[];

  const ratings: RatingInput[] = rows
    .filter((r) => r.status === "completed" && r.scores && r.is_named !== null)
    .map((r) => ({
      id: r.id,
      isNamed: Boolean(r.is_named),
      raterName: r.is_named ? r.rater_name : null,
      email: r.is_named ? r.invited_email : null,
      relationship: r.relationship,
      scores: r.scores as ObserverScores,
      cantTellShare: cantTellShare(r),
    }));

  const self = latest && hasAllAxes(latest.scores) ? { scores: latest.scores, takenAt: latest.taken_at } : null;
  return {
    myName,
    self,
    pending: rows
      .filter((r) => r.status === "invited" && r.invited_email)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((r) => ({ id: r.id, email: r.invited_email as string, createdAt: r.created_at })),
    view: buildOthersView(self?.scores ?? null, ratings),
  };
}

// The subject can cancel an invitation or delete a named rating by id.
// Anonymous ratings are never listed individually, so they can only be
// deleted all together (deleteAnonymous).
export async function deleteForSubject(db: Db, actor: Actor, id: string): Promise<{ ok: true } | Fail> {
  const { data: row } = await db
    .from("observer_ratings")
    .select("id, status, is_named")
    .eq("id", id)
    .eq("subject_user_id", actor.id)
    .maybeSingle();
  if (!row || (row.status === "completed" && !row.is_named)) return fail(404, "Not found.");
  await db.from("observer_ratings").delete().eq("id", id).eq("subject_user_id", actor.id);
  return { ok: true };
}

export async function deleteAnonymous(db: Db, actor: Actor): Promise<{ ok: true }> {
  await db
    .from("observer_ratings")
    .delete()
    .eq("subject_user_id", actor.id)
    .eq("status", "completed")
    .eq("is_named", false);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Rater side (no account; identified by the link token)

async function rowForToken(db: Db, token: string) {
  if (!isWellFormedShareToken(token)) return null;
  const { data } = await db
    .from("observer_ratings")
    .select("id, subject_user_id, questionnaire_id, status")
    .eq("token_hash", hashShareToken(token))
    .maybeSingle();
  return data as { id: string; subject_user_id: string; questionnaire_id: number; status: string } | null;
}

async function subjectName(db: Db, userId: string): Promise<string> {
  const { data } = await db
    .from("people")
    .select("name")
    .eq("owner_user_id", userId)
    .eq("is_self", true)
    .maybeSingle();
  const name = typeof data?.name === "string" ? data.name.trim() : "";
  // The subject's email is never shown to the rater, so there is no
  // email-based fallback here.
  return name || "Someone you know";
}

export type RaterView =
  | { state: "open"; subjectName: string; questions: { text: string; direction: string }[] }
  | { state: "completed"; subjectName: string };

export async function getForRater(db: Db, token: string): Promise<RaterView | null> {
  await purgeExpired(db);
  const row = await rowForToken(db, token);
  if (!row) return null;
  const name = await subjectName(db, row.subject_user_id);
  if (row.status === "completed") return { state: "completed", subjectName: name };
  const questions = observerQuestions(row.questionnaire_id, name);
  if (!questions) return null;
  return { state: "open", subjectName: name, questions };
}

export type Submission = {
  answers: unknown;
  named: unknown;
  raterName: unknown;
  relationship: unknown;
  knownFor: unknown;
  researchConsent: unknown;
};

export function cleanRaterName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  if (!name || name.length > RATER_NAME_MAX) return null;
  return name;
}

export async function submitRating(
  db: Db,
  token: string,
  body: Submission
): Promise<{ ok: true } | Fail> {
  const row = await rowForToken(db, token);
  if (!row) return fail(404, "This link is not valid or has expired.");
  if (row.status !== "invited") return fail(409, "You have already answered.");

  const questions = observerQuestions(row.questionnaire_id, "x");
  if (!questions) return fail(500, "This questionnaire is not available.");

  const answers = body.answers;
  if (!Array.isArray(answers) || answers.length !== questions.length || !answers.every(isValidObserverAnswer)) {
    return fail(400, "Please answer every statement (\"Can't tell\" is fine).");
  }
  if (answers.every((a) => a === CANT_TELL)) {
    return fail(400, "Please answer at least some statements other than \"Can't tell\".");
  }
  if (typeof body.named !== "boolean") return fail(400, "Choose whether to show your name.");
  const raterName = body.named ? cleanRaterName(body.raterName) : null;
  if (body.named && !raterName) return fail(400, `Enter your name (up to ${RATER_NAME_MAX} characters).`);
  if (!RELATIONSHIPS.includes(body.relationship as RelationshipKey)) return fail(400, "Choose how you know them.");
  if (!KNOWN_FOR.includes(body.knownFor as KnownFor)) return fail(400, "Choose how long you have known them.");

  const { scores } = scoreObserverAnswers(answers as number[], questions);
  const update: Record<string, unknown> = {
    status: "completed",
    completed_at: new Date().toISOString(),
    is_named: body.named,
    rater_name: raterName,
    relationship: body.relationship,
    known_for: body.knownFor,
    answers,
    scores,
    research_consent: body.researchConsent === true,
  };
  // An anonymous rating keeps nothing that links it to the rater's address.
  if (!body.named) update.invited_email = null;

  const { error } = await db
    .from("observer_ratings")
    .update(update)
    .eq("id", row.id)
    .eq("status", "invited");
  if (error) return fail(500, "Could not save your answers. Please try again.");
  return { ok: true };
}

// Declining an invitation or withdrawing a submitted rating deletes it.
export async function withdrawByToken(db: Db, token: string): Promise<{ ok: true } | Fail> {
  const row = await rowForToken(db, token);
  if (!row) return fail(404, "This link is not valid or has expired.");
  await db.from("observer_ratings").delete().eq("id", row.id);
  return { ok: true };
}
