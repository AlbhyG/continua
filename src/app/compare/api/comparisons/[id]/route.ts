import { NextResponse } from "next/server";
import { getView, isUuid, revoke, switchToLatestResult } from "@/lib/comparison/service";
import { getActor, NO_STORE } from "../../auth";

const NOT_FOUND = () =>
  NextResponse.json({ error: "Comparison not found." }, { status: 404, headers: NO_STORE });

// View a comparison. Only an accepted participant can see it, and only while active.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) return NOT_FOUND();
  const got = await getActor();
  if ("error" in got) return got.error;
  const view = await getView(got.db, got.actor, id);
  if (!view) return NOT_FOUND();
  return NextResponse.json(view, { headers: NO_STORE });
}

// End a comparison. Removes it for both people immediately.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) return NOT_FOUND();
  const got = await getActor();
  if ("error" in got) return got.error;
  const result = await revoke(got.db, got.actor, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

// Switch my side of a comparison to my latest result. Only my own side changes.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) return NOT_FOUND();
  const got = await getActor();
  if ("error" in got) return got.error;
  const body = await request.json().catch(() => ({}));
  if (body?.action !== "use-latest") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400, headers: NO_STORE });
  }
  const result = await switchToLatestResult(got.db, got.actor, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
