import { NextRequest, NextResponse } from "next/server";
import { getResultById } from "@/lib/quiz/db";
import { createShareLink, isShareableResult, revokeShareLinks } from "@/lib/quiz/share";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Only the result's owner (by account or by the browser's anonymous token)
// can create or turn off its share links. Admin sessions are deliberately not
// allowed to share someone else's result.
async function ownedResult(request: NextRequest, id: string) {
  const resultId = Number(id);
  if (!Number.isInteger(resultId) || resultId <= 0) {
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
    return { error: NextResponse.json({ error: "Sharing is unavailable" }, { status: 503 }) };
  }

  const row = await getResultById(resultId, {
    anonymousToken: token,
    userId: user?.id,
    supabase: admin,
  });
  if (!row) {
    return { error: NextResponse.json({ error: "Result not found" }, { status: 404 }) };
  }
  return { resultId, admin, personId: (row.person_id as string | null) ?? null };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owned = await ownedResult(request, id);
  if ("error" in owned) return owned.error;

  if (!(await isShareableResult(owned.personId, owned.admin))) {
    return NextResponse.json(
      { error: "Only your own results can be shared" },
      { status: 403 }
    );
  }

  try {
    const shareLink = await createShareLink(owned.resultId, owned.admin);
    return NextResponse.json({ shareLink });
  } catch {
    return NextResponse.json({ error: "Could not create a share link" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owned = await ownedResult(request, id);
  if ("error" in owned) return owned.error;

  try {
    const removed = await revokeShareLinks(owned.resultId, owned.admin);
    return NextResponse.json({ removed });
  } catch {
    return NextResponse.json({ error: "Could not turn off sharing" }, { status: 500 });
  }
}
