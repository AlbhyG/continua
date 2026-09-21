import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Share links hold only a random token. The scores are looked up in the
// database each time the link is opened, so a link can be turned off, and it
// stops working if the result is deleted (result_shares cascades on delete).

export function newShareToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function shareUrl(token: string): string {
  return `/quiz/share?t=${encodeURIComponent(token)}`;
}

// Only a person's own result can be shared: a result with no person record
// (taken without an account), or one recorded for the user's own "self" person.
// A result recorded for someone else cannot be shared.
export async function isShareable(
  admin: SupabaseClient,
  personId: string | null
): Promise<boolean> {
  if (!personId) return true;
  const { data } = await admin
    .from("people")
    .select("is_self")
    .eq("id", personId)
    .single();
  return data?.is_self === true;
}

export async function getActiveShareToken(
  admin: SupabaseClient,
  resultId: number
): Promise<string | null> {
  const { data } = await admin
    .from("result_shares")
    .select("token")
    .eq("result_id", resultId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.token ?? null;
}

export async function createShare(
  admin: SupabaseClient,
  resultId: number
): Promise<string | null> {
  const existing = await getActiveShareToken(admin, resultId);
  if (existing) return existing;
  const token = newShareToken();
  const { error } = await admin
    .from("result_shares")
    .insert({ token, result_id: resultId });
  return error ? null : token;
}

export async function revokeShares(
  admin: SupabaseClient,
  resultId: number
): Promise<boolean> {
  const { error } = await admin
    .from("result_shares")
    .update({ revoked_at: new Date().toISOString() })
    .eq("result_id", resultId)
    .is("revoked_at", null);
  return !error;
}
