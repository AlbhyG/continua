import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { submitRating } from "@/lib/observer/service";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const db = createAdminClient();
  if (!db) return NextResponse.json({ error: "This service is unavailable." }, { status: 503, headers: NO_STORE });
  const result = await submitRating(db, String(body?.token ?? ""), {
    answers: body?.answers,
    named: body?.named,
    initialNamed: body?.initialNamed,
    raterName: body?.raterName,
    relationship: body?.relationship,
    knownFor: body?.knownFor,
    researchConsent: body?.researchConsent,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
