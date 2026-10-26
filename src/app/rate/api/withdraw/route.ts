import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withdrawByToken } from "@/lib/observer/service";

const NO_STORE = { "Cache-Control": "no-store" };

// Decline an invitation, or withdraw answers already given. Either way the
// invitation and any answers are deleted.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const db = createAdminClient();
  if (!db) return NextResponse.json({ error: "This service is unavailable." }, { status: 503, headers: NO_STORE });
  const result = await withdrawByToken(db, String(body?.token ?? ""));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
