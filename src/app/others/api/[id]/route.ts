import { NextResponse } from "next/server";
import { isUuid } from "@/lib/comparison/service";
import { deleteForSubject } from "@/lib/observer/service";
import { getSubject, NO_STORE } from "../auth";

// Cancel an invitation, or delete a named rating.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found." }, { status: 404, headers: NO_STORE });
  const got = await getSubject();
  if ("error" in got) return got.error;
  const result = await deleteForSubject(got.db, got.actor, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
