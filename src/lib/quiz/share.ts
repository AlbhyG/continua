import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AxisScores } from "./scoring";

// Share links carry only a random token. The scores stay in quiz_results and
// are looked up on every view, so a link stops working as soon as the owner
// turns sharing off or deletes the result (see migration 00023).

const TOKEN_BYTES = 24;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

export function hashShareToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isWellFormedShareToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

export function shareUrlPath(token: string): string {
  return `/quiz/share?t=${token}`;
}

/**
 * Only a person's own results can be shared. Results recorded about someone
 * else (My Relationships) cannot, because that person never agreed to it.
 */
export async function isShareableResult(
  personId: string | null,
  supabase: SupabaseClient
): Promise<boolean> {
  if (!personId) return true;
  const { data } = await supabase
    .from("people")
    .select("is_self")
    .eq("id", personId)
    .maybeSingle();
  return Boolean(data?.is_self);
}

/** Creates a new link for a result the caller has already been verified to own. */
export async function createShareLink(
  resultId: number,
  supabase: SupabaseClient
): Promise<string> {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const { error } = await supabase
    .from("result_share_links")
    .insert({ token_hash: hashShareToken(token), result_id: resultId });
  if (error) throw error;
  return shareUrlPath(token);
}

/** Turns off every link for a result. Returns how many were removed. */
export async function revokeShareLinks(
  resultId: number,
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase
    .from("result_share_links")
    .delete()
    .eq("result_id", resultId)
    .select("token_hash");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function countShareLinks(
  resultId: number,
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("result_share_links")
    .select("token_hash", { count: "exact", head: true })
    .eq("result_id", resultId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  if (error) return 0;
  return count ?? 0;
}

export interface SharedResultRow {
  score: number;
  questionnaireId: number;
  scores: AxisScores | null;
}

/** Looks up a live link. Returns null if it never existed, was turned off, expired, or its result was deleted. */
export async function resolveShareLink(
  token: string,
  supabase: SupabaseClient
): Promise<SharedResultRow | null> {
  if (!isWellFormedShareToken(token)) return null;

  const { data: link } = await supabase
    .from("result_share_links")
    .select("result_id, expires_at")
    .eq("token_hash", hashShareToken(token))
    .maybeSingle();
  if (!link) return null;
  if (link.expires_at && new Date(link.expires_at) <= new Date()) return null;

  const { data: row } = await supabase
    .from("quiz_results")
    .select("score, questionnaire_id, scores")
    .eq("id", link.result_id)
    .maybeSingle();
  if (!row) return null;

  return {
    score: row.score,
    questionnaireId: row.questionnaire_id,
    scores: (row.scores as AxisScores | null) ?? null,
  };
}
