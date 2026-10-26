import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getForRater } from "@/lib/observer/service";

const NO_STORE = { "Cache-Control": "no-store" };

// What a rater sees for their link: whose questionnaire it is and the items,
// or that they have already answered. No account needed; the token is the key.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const db = createAdminClient();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503, headers: NO_STORE });
  const view = await getForRater(db, token);
  if (!view) return NextResponse.json({ error: "not_found" }, { status: 404, headers: NO_STORE });
  return NextResponse.json(view, { headers: NO_STORE });
}
