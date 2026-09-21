import { NextRequest, NextResponse } from "next/server";
import { isUuid, respond } from "@/lib/comparison/service";
import { getActor, NO_STORE } from "../../../auth";

// Accept or decline an invitation.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404, headers: NO_STORE });
  }
  const got = await getActor();
  if ("error" in got) return got.error;
  const body = await request.json().catch(() => ({}));
  if (body?.action !== "accept" && body?.action !== "decline") {
    return NextResponse.json({ error: "Choose accept or decline." }, { status: 400, headers: NO_STORE });
  }
  const result = await respond(got.db, got.actor, id, body.action);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
