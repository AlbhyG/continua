import { NextResponse } from "next/server";
import { deleteAnonymous } from "@/lib/observer/service";
import { getSubject, NO_STORE } from "../auth";

// Delete every anonymous rating of me. They are never listed one by one, so
// they can only be deleted together.
export async function DELETE() {
  const got = await getSubject();
  if ("error" in got) return got.error;
  await deleteAnonymous(got.db, got.actor);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
