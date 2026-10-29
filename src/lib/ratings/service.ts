import type { SupabaseClient } from "@supabase/supabase-js";
import type { AxisScores, Questionnaire } from "@/lib/quiz/scoring";
import { getQuestionnaire as loadQuestionnaire } from "@/lib/quiz/questionnaires";
import { displayNameFor, normEmail, type Actor } from "@/lib/comparison/service";
import { isPronoun, raterOptions, raterText, type Pronoun } from "./questions";
import { AXES, isValidAnswers, scoreRating, type PartialScores } from "./score";

// Server-side logic for How Others See You. Every function takes the
// service-role client and the signed-in user, and enforces who may see what.
//
// Privacy rules enforced here:
// - Only the person being rated (the subject) can invite raters.
// - A rater sees only the questions, never the subject's own scores.
// - The subject sees a named rater's scores under that rater's name, and
//   anonymous raters only as an average, and only once there are at least
//   MIN_ANONYMOUS of them. Nothing tells the subject which invitee responded
//   anonymously.
// - A rater can withdraw; the subject can remove a named rating. Both delete it.

type Db = SupabaseClient;
type Fail = { ok: false; status: number; error: string };
const fail = (status: number, error: string): Fail => ({ ok: false, status, error });
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const MAX_INVITES_PER_DAY = 10;
export const INVITE_EXPIRY_DAYS = 30;
export const MIN_ANONYMOUS = 2;
// Ratings this close together on an axis count as agreeing.
export const AGREE_RANGE = 2;
// A gap this large between your view and others' is worth pointing out.
export const NOTABLE_GAP = 1.5;

type QLoader = (id: number) => Questionnaire | undefined;

async function selfPersonOf(db: Db, userId: string) {
  const { data } = await db
    .from("people")
    .select("id, name, pronoun")
    .eq("owner_user_id", userId)
    .eq("is_self", true)
    .maybeSingle();
  return data as { id: string; name: string | null; pronoun: string | null } | null;
}

export async function pronounFor(db: Db, userId: string): Promise<Pronoun> {
  const p = await selfPersonOf(db, userId);
  return isPronoun(p?.pronoun) ? p!.pronoun as Pronoun : "they";
}

// The user's most recent complete self-assessment.
async function latestOwnResult(
  db: Db,
  userId: string
): Promise<{ questionnaire_id: number; scores: AxisScores; taken_at: string } | null> {
  const self = await selfPersonOf(db, userId);
  if (!self) return null;
  const { data } = await db
    .from("quiz_results")
    .select("id, questionnaire_id, scores, taken_at")
    .eq("person_id", self.id)
    .order("taken_at", { ascending: false })
    .limit(20);
  const row = (data ?? []).find(
    (r) => r.scores && AXES.every((a) => Number.isFinite((r.scores as Record<string, unknown>)[a]))
  );
  return row
    ? { questionnaire_id: row.questionnaire_id as number, scores: row.scores as AxisScores, taken_at: row.taken_at as string }
    : null;
}

export async function purgeExpired(db: Db): Promise<void> {
  const cutoff = new Date(Date.now() - INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await db.from("ratings").delete().eq("status", "invited").lt("created_at", cutoff);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await db.from("rating_invite_log").delete().lt("sent_at", dayAgo);
}

export async function createRatingInvite(
  db: Db,
  actor: Actor,
  emailRaw: string
): Promise<{ ok: true; id: string } | Fail> {
  const email = normEmail(emailRaw || "");
  if (!EMAIL_RE.test(email) || email.length > 254) return fail(400, "Enter a valid email address.");
  if (email === normEmail(actor.email)) return fail(400, "You can't invite yourself to rate you.");

  const latest = await latestOwnResult(db, actor.id);
  if (!latest) return fail(400, "Take the assessment yourself first, then invite people to rate you.");

  await purgeExpired(db);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("rating_invite_log")
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", actor.id)
    .gte("sent_at", since);
  if ((count ?? 0) >= MAX_INVITES_PER_DAY) {
    return fail(429, "You have sent the most invitations allowed in a day. Please try again tomorrow.");
  }

  const { data: existing } = await db
    .from("ratings")
    .select("id")
    .eq("subject_user_id", actor.id)
    .eq("rater_email", email);
  if ((existing ?? []).length > 0) return fail(409, "You have already invited this person.");

  const { data: created, error } = await db
    .from("ratings")
    .insert({ subject_user_id: actor.id, rater_email: email, questionnaire_id: latest.questionnaire_id, status: "invited" })
    .select("id")
    .single();
  if (error || !created) return fail(500, "Could not create the invitation.");
  await db.from("rating_invite_log").insert({ user_id: actor.id, sent_at: new Date().toISOString() });
  return { ok: true, id: created.id as string };
}

// ---- What the subject sees ----

export type AxisSummary = {
  axis: keyof AxisScores;
  self: number | null;
  others: number | null; // average of the points shown (named raters and the anonymous average)
  low: number | null;
  high: number | null;
  points: number; // how many points the average is based on
  agree: boolean | null; // null when fewer than two points
  gap: number | null; // others - self
};

export type SubjectView = {
  self: { scores: AxisScores; takenAt: string } | null;
  pronoun: Pronoun;
  invited: { email: string; invitedAt: string }[];
  named: { id: string; name: string; scores: PartialScores; submittedAt: string }[];
  anonymous: { count: number; average: PartialScores | null };
  axes: AxisSummary[];
  notableGaps: AxisSummary[];
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function averageScores(list: PartialScores[]): PartialScores {
  const out = {} as PartialScores;
  for (const a of AXES) {
    const vals = list.map((s) => s[a]).filter((v): v is number => typeof v === "number");
    out[a] = vals.length ? round1(vals.reduce((x, y) => x + y, 0) / vals.length) : null;
  }
  return out;
}

// The comparison shown to the subject. Anonymous raters enter only through
// their average, so no individual anonymous score can be worked out.
export function summarize(
  self: AxisScores | null,
  named: PartialScores[],
  anonymousAverage: PartialScores | null
): { axes: AxisSummary[]; notableGaps: AxisSummary[] } {
  const sources = anonymousAverage ? [...named, anonymousAverage] : named;
  const axes = AXES.map((axis): AxisSummary => {
    const pts = sources.map((s) => s[axis]).filter((v): v is number => typeof v === "number");
    const others = pts.length ? round1(pts.reduce((x, y) => x + y, 0) / pts.length) : null;
    const low = pts.length ? Math.min(...pts) : null;
    const high = pts.length ? Math.max(...pts) : null;
    const s = self ? self[axis] : null;
    return {
      axis,
      self: s,
      others,
      low,
      high,
      points: pts.length,
      agree: pts.length >= 2 ? (high as number) - (low as number) <= AGREE_RANGE : null,
      gap: others !== null && s !== null ? round1(others - s) : null,
    };
  });
  const notableGaps = axes
    .filter((a) => a.gap !== null && Math.abs(a.gap) >= NOTABLE_GAP)
    .sort((x, y) => Math.abs(y.gap as number) - Math.abs(x.gap as number));
  return { axes, notableGaps };
}

export async function subjectView(db: Db, actor: Actor): Promise<SubjectView> {
  await purgeExpired(db);
  const [latest, pronoun] = await Promise.all([latestOwnResult(db, actor.id), pronounFor(db, actor.id)]);
  const { data } = await db
    .from("ratings")
    .select("id, rater_email, rater_user_id, status, visibility, scores, created_at, submitted_at")
    .eq("subject_user_id", actor.id);
  const rows = (data ?? []) as Array<{
    id: string;
    rater_email: string;
    rater_user_id: string | null;
    status: string;
    visibility: string | null;
    scores: PartialScores | null;
    created_at: string;
    submitted_at: string | null;
  }>;

  // Every invitation is listed the same way, answered or not, so the list
  // can't be used to tell who answered anonymously.
  const invited = rows
    .map((r) => ({ email: r.rater_email, invitedAt: r.created_at }))
    .sort((a, b) => (a.invitedAt < b.invitedAt ? 1 : -1));

  const submitted = rows.filter((r) => r.status === "submitted" && r.scores);
  const named = [];
  for (const r of submitted.filter((r) => r.visibility === "named")) {
    named.push({
      id: r.id,
      name: await displayNameFor(db, r.rater_user_id, r.rater_email),
      scores: r.scores as PartialScores,
      submittedAt: r.submitted_at as string,
    });
  }
  const anon = submitted.filter((r) => r.visibility === "anonymous");
  const anonymousAverage = anon.length >= MIN_ANONYMOUS ? averageScores(anon.map((r) => r.scores as PartialScores)) : null;
  const { axes, notableGaps } = summarize(latest?.scores ?? null, named.map((n) => n.scores), anonymousAverage);
  return {
    self: latest ? { scores: latest.scores, takenAt: latest.taken_at } : null,
    pronoun,
    invited,
    named,
    anonymous: { count: anon.length, average: anonymousAverage },
    axes,
    notableGaps,
  };
}

// The subject removes a named rating. (Anonymous ratings can't be removed one
// by one, because the subject isn't told which they are.)
export async function removeNamed(db: Db, actor: Actor, id: string): Promise<{ ok: true } | Fail> {
  const { data } = await db
    .from("ratings")
    .select("id")
    .eq("id", id)
    .eq("subject_user_id", actor.id)
    .eq("visibility", "named")
    .maybeSingle();
  if (!data) return fail(404, "Rating not found.");
  await db.from("ratings").delete().eq("id", id);
  return { ok: true };
}

// ---- What the rater sees ----

export type RaterView = {
  requests: { id: string; subjectName: string; subjectPronoun: Pronoun; invitedAt: string }[];
  given: { id: string; subjectName: string; visibility: string; submittedAt: string }[];
};

export async function raterView(db: Db, actor: Actor): Promise<RaterView> {
  await purgeExpired(db);
  const me = normEmail(actor.email);
  const { data } = await db
    .from("ratings")
    .select("id, subject_user_id, rater_email, rater_user_id, status, visibility, created_at, submitted_at")
    .or(`rater_email.eq.${me},rater_user_id.eq.${actor.id}`);
  const rows = (data ?? []) as Array<{
    id: string;
    subject_user_id: string;
    rater_email: string;
    rater_user_id: string | null;
    status: string;
    visibility: string | null;
    created_at: string;
    submitted_at: string | null;
  }>;
  const requests = [];
  const given = [];
  for (const r of rows) {
    const subjectName = await displayNameFor(db, r.subject_user_id, "");
    if (r.status === "invited" && r.rater_email === me) {
      requests.push({ id: r.id, subjectName, subjectPronoun: await pronounFor(db, r.subject_user_id), invitedAt: r.created_at });
    } else if (r.status === "submitted") {
      given.push({ id: r.id, subjectName, visibility: r.visibility ?? "named", submittedAt: r.submitted_at as string });
    }
  }
  return { requests, given };
}

export type RatingForm = {
  subjectName: string;
  // Questions and answer choices use the first name only ("Albhy", not "Albhy Galuten").
  firstName: string;
  questions: string[];
  options: { value: number; label: string }[];
};

async function openInvitation(db: Db, actor: Actor, id: string) {
  const { data } = await db
    .from("ratings")
    .select("id, subject_user_id, rater_email, questionnaire_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.status !== "invited" || data.rater_email !== normEmail(actor.email)) return null;
  return data as { id: string; subject_user_id: string; questionnaire_id: number };
}

export async function ratingForm(
  db: Db,
  actor: Actor,
  id: string,
  load: QLoader = loadQuestionnaire
): Promise<{ ok: true; form: RatingForm } | Fail> {
  const inv = await openInvitation(db, actor, id);
  if (!inv) return fail(404, "This invitation isn't available. It may have been answered, withdrawn, or sent to a different email address.");
  const q = load(inv.questionnaire_id);
  if (!q) return fail(500, "The questions for this invitation could not be loaded.");
  const [name, pronoun] = await Promise.all([
    displayNameFor(db, inv.subject_user_id, ""),
    pronounFor(db, inv.subject_user_id),
  ]);
  const subjectName = name || "this person";
  const firstName = name ? name.trim().split(/\s+/)[0] : "this person";
  const questions = q.questions.map((qq) => raterText(qq.text, firstName, pronoun));
  if (questions.some((t) => t === null)) return fail(500, "Some questions couldn't be prepared.");
  return {
    ok: true,
    form: { subjectName, firstName, questions: questions as string[], options: raterOptions(firstName) },
  };
}

export async function submitRating(
  db: Db,
  actor: Actor,
  id: string,
  answers: unknown,
  visibility: unknown,
  load: QLoader = loadQuestionnaire
): Promise<{ ok: true } | Fail> {
  const inv = await openInvitation(db, actor, id);
  if (!inv) return fail(404, "This invitation isn't available.");
  if (visibility !== "named" && visibility !== "anonymous") return fail(400, "Choose whether to be named or anonymous.");
  const q = load(inv.questionnaire_id);
  if (!q) return fail(500, "The questions for this invitation could not be loaded.");
  if (!isValidAnswers(answers, q.questions.length)) return fail(400, "Please answer every question, or choose Can't tell.");
  const scores = scoreRating(answers, q.questions);
  if (AXES.every((a) => scores[a] === null)) {
    return fail(400, "Too many answers were Can't tell to give a result on any axis. Answer a few more where you can.");
  }
  const { error } = await db
    .from("ratings")
    .update({
      status: "submitted",
      rater_user_id: actor.id,
      visibility,
      answers,
      scores,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "invited");
  if (error) return fail(500, "Your rating could not be saved.");
  return { ok: true };
}

// A rater withdraws: deletes their rating (or declines an open invitation).
export async function withdraw(db: Db, actor: Actor, id: string): Promise<{ ok: true } | Fail> {
  const me = normEmail(actor.email);
  const { data } = await db
    .from("ratings")
    .select("id, rater_email, rater_user_id")
    .eq("id", id)
    .maybeSingle();
  if (!data || (data.rater_user_id !== actor.id && data.rater_email !== me)) return fail(404, "Rating not found.");
  await db.from("ratings").delete().eq("id", id);
  return { ok: true };
}
