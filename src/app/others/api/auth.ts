import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Actor } from "@/lib/comparison/service";

// The person being described is always the signed-in user. There is no
// administrative read path for ratings.
export async function getSubject() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) };
  }
  const db = createAdminClient();
  if (!db) {
    return { error: NextResponse.json({ error: "This service is unavailable." }, { status: 503 }) };
  }
  const actor: Actor = { id: user.id, email: user.email };
  return { db, actor };
}

export const NO_STORE = { "Cache-Control": "no-store" };
