import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AxisScores } from "./scoring";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function ensureUser(
  anonymousToken: string,
  supabase: SupabaseClient = getSupabase()
) {
  await supabase
    .from("quiz_users")
    .upsert({ anonymous_token: anonymousToken }, { onConflict: "anonymous_token" });
}

export async function storeResult(
  anonymousToken: string,
  questionnaireId: number,
  score: number,
  scores: AxisScores,
  options?: {
    userId?: string | null
    personId?: string | null
    supabase?: SupabaseClient
  }
): Promise<number> {
  const supabase = options?.supabase ?? getSupabase();
  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      anonymous_token: anonymousToken,
      questionnaire_id: questionnaireId,
      score,
      scores,
      user_id: options?.userId ?? null,
      person_id: options?.personId ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function getCompletedIds(anonymousToken: string): Promise<number[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("quiz_results")
    .select("questionnaire_id")
    .eq("anonymous_token", anonymousToken);

  return (data || []).map((r) => r.questionnaire_id);
}

export async function getCompletedIdsForPerson(
  personId: string,
  supabase: SupabaseClient
): Promise<number[]> {
  const { data } = await supabase
    .from("quiz_results")
    .select("questionnaire_id")
    .eq("person_id", personId);

  return (data || []).map((result) => result.questionnaire_id);
}

export async function getHistory(anonymousToken: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("quiz_results")
    .select("id, questionnaire_id, score, scores, taken_at")
    .eq("anonymous_token", anonymousToken)
    .order("taken_at", { ascending: true });

  return { results: data || [] };
}

export async function getResultById(
  resultId: number,
  options: {
    anonymousToken?: string | null
    userId?: string | null
    supabase?: SupabaseClient
  }
) {
  const supabase = options.supabase ?? getSupabase();
  const { data } = await supabase
    .from("quiz_results")
    .select("id, anonymous_token, user_id, person_id, questionnaire_id, score, scores, taken_at")
    .eq("id", resultId)
    .single();

  if (!data) return null;
  const ownsByAccount = Boolean(
    options.userId && data.user_id === options.userId
  );
  const ownsByToken = Boolean(
    options.anonymousToken && data.anonymous_token === options.anonymousToken
  );
  if (!ownsByAccount && !ownsByToken) return null;
  return data;
}
