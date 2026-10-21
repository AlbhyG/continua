import type { SupabaseClient } from "@supabase/supabase-js";

// How many other saved results this person has, so a results page can offer
// to compare with them. Only meaningful for signed-in owners (anonymous
// results have no history page).
export async function countEarlierResults(
  db: SupabaseClient,
  personId: string | null | undefined,
  excludeResultId: number
): Promise<number> {
  if (!personId) return 0;
  const { count } = await db
    .from("quiz_results")
    .select("id", { count: "exact", head: true })
    .eq("person_id", personId)
    .neq("id", excludeResultId);
  return count ?? 0;
}
