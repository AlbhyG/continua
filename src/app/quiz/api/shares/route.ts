import { NextRequest, NextResponse } from "next/server";
import { getResultById } from "@/lib/quiz/db";
import {
  createShare,
  getActiveShareToken,
  isShareable,
  revokeShares,
  shareUrl,
} from "@/lib/quiz/shares";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Create, look up, and revoke the share link for one of the caller's own results.
// Only the owner (signed-in account or the anonymous browser that took it) may act.
// Administrators cannot create or revoke shares for someone else.

async function loadOwnedResult(request: NextRequest, resultId: number) {
  if (!Number.isSafeInteger(resultId) || resultId < 1) {
    return { error: NextResponse.json({ error: "Invalid result ID" }, { status: 400 }) };
  }
  const token = request.cookies.get("anonymous_token")?.value;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!token && !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  const admin = createAdminClient();
  if (!admin) {
    return { error: NextResponse.json({ error: "Share service unavailable" }, { status: 503 }) };
  }
  const row = await getResultById(resultId, {
    anonymousToken: token,
    userId: user?.id,
    supabase: admin,
    allowAdmin: false,
  });
  if (!row) {
    return { error: NextResponse.json({ error: "Result not found" }, { status: 404 }) };
  }
  return { admin, row };
}

const NO_STORE = { "Cache-Control": "no-store" };

// Is this result shareable, and is there an active link?
export async function GET(request: NextRequest) {
  const resultId = Number(request.nextUrl.searchParams.get("resultId"));
  const loaded = await loadOwnedResult(request, resultId);
  if ("error" in loaded) return loaded.error;
  const { admin, row } = loaded;

  const shareable = await isShareable(admin, row.person_id);
  const token = shareable ? await getActiveShareToken(admin, row.id) : null;
  return NextResponse.json(
    { shareable, url: token ? shareUrl(token) : null },
    { headers: NO_STORE }
  );
}

// Create a link (or return the active one).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const loaded = await loadOwnedResult(request, Number(body?.resultId));
  if ("error" in loaded) return loaded.error;
  const { admin, row } = loaded;

  if (!(await isShareable(admin, row.person_id))) {
    return NextResponse.json(
      { error: "Only your own results can be shared" },
      { status: 403 }
    );
  }
  const token = await createShare(admin, row.id);
  if (!token) {
    return NextResponse.json({ error: "Could not create link" }, { status: 500 });
  }
  return NextResponse.json({ url: shareUrl(token) }, { headers: NO_STORE });
}

// Turn the link off.
export async function DELETE(request: NextRequest) {
  const resultId = Number(request.nextUrl.searchParams.get("resultId"));
  const loaded = await loadOwnedResult(request, resultId);
  if ("error" in loaded) return loaded.error;
  const { admin, row } = loaded;

  if (!(await revokeShares(admin, row.id))) {
    return NextResponse.json({ error: "Could not turn off link" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
