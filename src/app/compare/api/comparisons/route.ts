import { NextRequest, NextResponse } from "next/server";
import { createComparison, listForUser } from "@/lib/comparison/service";
import { getActor, NO_STORE } from "../auth";

// List my comparisons and invitations.
export async function GET() {
  const got = await getActor();
  if ("error" in got) return got.error;
  const comparisons = await listForUser(got.db, got.actor);
  return NextResponse.json({ comparisons }, { headers: NO_STORE });
}

// Invite someone (by email) to compare. Nothing is shown until they accept.
export async function POST(request: NextRequest) {
  const got = await getActor();
  if ("error" in got) return got.error;
  const body = await request.json().catch(() => ({}));
  const result = await createComparison(got.db, got.actor, String(body?.email ?? ""));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  return NextResponse.json({ id: result.id }, { headers: NO_STORE });
}
