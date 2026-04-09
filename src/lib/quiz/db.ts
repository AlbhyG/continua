import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function ensureUser(anonymousToken: string) {
  const supabase = getSupabase();
  await supabase
    .from("quiz_users")
    .upsert({ anonymous_token: anonymousToken }, { onConflict: "anonymous_token" });
}

export async function storeResult(
  anonymousToken: string,
  questionnaireId: number,
  score: number
): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      anonymous_token: anonymousToken,
      questionnaire_id: questionnaireId,
      score,
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

export async function getHistory(anonymousToken: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("quiz_results")
    .select("id, questionnaire_id, score, taken_at")
    .eq("anonymous_token", anonymousToken)
    .order("taken_at", { ascending: true });

  const results = data || [];
  const average =
    results.length > 0
      ? Math.round(
          (results.reduce((sum, r) => sum + r.score, 0) / results.length) * 10
        ) / 10
      : null;

  return { results, average };
}

export async function getResultById(resultId: number, anonymousToken: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("quiz_results")
    .select("id, anonymous_token, questionnaire_id, score, taken_at")
    .eq("id", resultId)
    .single();

  if (!data || data.anonymous_token !== anonymousToken) return null;
  return data;
}
