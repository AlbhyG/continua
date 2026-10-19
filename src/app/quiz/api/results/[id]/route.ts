import { NextRequest, NextResponse } from "next/server";
import { getResultById } from "@/lib/quiz/db";
import { getAxisLabel, AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import { countShareLinks, isShareableResult } from "@/lib/quiz/share";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAdminContactsSession } from "@/lib/admin/contacts-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const resultId = Number(id);
  const token = request.cookies.get("anonymous_token")?.value;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasAdminSession = await hasAdminContactsSession();

  if (isNaN(resultId)) {
    return NextResponse.json({ error: "Invalid result ID" }, { status: 400 });
  }

  if (!token && !user && !hasAdminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Result service unavailable" },
      { status: 503 }
    );
  }

  const row = await getResultById(resultId, {
    anonymousToken: token,
    userId: user?.id,
    supabase: admin,
    allowAdmin: hasAdminSession,
  });
  if (!row) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  const scores = (row.scores || { empathy: row.score }) as AxisScores;

  const axisResults = Object.entries(scores).map(([key, score]) => {
    const axis = key as keyof typeof AXIS_INFO;
    return {
      axis,
      name: AXIS_INFO[axis].name,
      score: score as number,
      label: getAxisLabel(axis, score as number),
      highLabel: AXIS_INFO[axis].highLabel,
      lowLabel: AXIS_INFO[axis].lowLabel,
    };
  });

  const activeShareCount = await countShareLinks(row.id, admin);
  const canShare = await isShareableResult(row.person_id ?? null, admin);

  return NextResponse.json({
    resultId: row.id,
    scores,
    axisResults,
    activeShareCount,
    canShare,
    personId: row.person_id,
  });
}

// Permanently deletes a result. Works for signed-in owners and for people who
// took the assessment without an account (matched by this browser's
// anonymous token). A result that has been linked to an account can only be
// deleted while signed in to that account. Share links are removed by the
// database (ON DELETE CASCADE, migration 00024).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const resultId = Number(id);
  if (!Number.isInteger(resultId) || resultId <= 0) {
    return NextResponse.json({ error: "Invalid result ID" }, { status: 400 });
  }

  const token = request.cookies.get("anonymous_token")?.value;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!token && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Result service unavailable" }, { status: 503 });
  }

  const row = await getResultById(resultId, {
    anonymousToken: token,
    userId: user?.id,
    supabase: admin,
  });
  if (!row) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }
  if (row.user_id && row.user_id !== user?.id) {
    return NextResponse.json(
      { error: "sign_in_required" },
      { status: 403 }
    );
  }

  const { error } = await admin.from("quiz_results").delete().eq("id", resultId);
  if (error) {
    return NextResponse.json({ error: "Could not delete result" }, { status: 500 });
  }
  return NextResponse.json({ deleted: true });
}
