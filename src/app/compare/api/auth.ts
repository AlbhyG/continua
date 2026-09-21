import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Actor } from "@/lib/comparison/service";

// Comparisons are for signed-in accounts only. No admin or shared-password
// access exists here: the actor is always the signed-in user.
export async function getActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { error: NextResponse.json({ error: "Sign in to compare." }, { status: 401 }) };
  }
  const db = createAdminClient();
  if (!db) {
    return { error: NextResponse.json({ error: "Comparison service unavailable" }, { status: 503 }) };
  }
  const actor: Actor = { id: user.id, email: user.email };
  return { db, actor };
}

export const NO_STORE = { "Cache-Control": "no-store" };
