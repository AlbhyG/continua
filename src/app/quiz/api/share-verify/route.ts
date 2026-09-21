import { NextRequest, NextResponse } from "next/server";
import { getExplanation, getAxisLabel, AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import { createAdminClient } from "@/lib/supabase/admin";

const NO_STORE = { "Cache-Control": "no-store" };

const GONE = () =>
  NextResponse.json(
    { error: "This link is no longer available." },
    { status: 404, headers: NO_STORE }
  );

// Public: anyone holding a valid, unrevoked share token can view that result.
// No sign-in is required. The token is looked up on every request, so a revoked
// link, or one whose result was deleted, stops working immediately.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  if (!token || token.length > 128) {
    return NextResponse.json(
      { error: "Missing share link" },
      { status: 400, headers: NO_STORE }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Share service unavailable" },
      { status: 503, headers: NO_STORE }
    );
  }

  const { data: share } = await admin
    .from("result_shares")
    .select("result_id, revoked_at")
    .eq("token", token)
    .maybeSingle();
  if (!share || share.revoked_at) return GONE();

  const { data: row } = await admin
    .from("quiz_results")
    .select("score, scores")
    .eq("id", share.result_id)
    .single();
  if (!row) return GONE();

  const scores = (row.scores ?? null) as AxisScores | null;
  const empathy = scores?.empathy ?? row.score;

  const axisResults = scores
    ? (Object.entries(scores) as [keyof typeof AXIS_INFO, number][]).map(
        ([axis, score]) => ({
          axis,
          name: AXIS_INFO[axis].name,
          score,
          label: getAxisLabel(axis, score),
          highLabel: AXIS_INFO[axis].highLabel,
          lowLabel: AXIS_INFO[axis].lowLabel,
        })
      )
    : null;

  return NextResponse.json(
    {
      score: empathy,
      label: getAxisLabel("empathy", empathy),
      explanation: getExplanation(empathy),
      scores,
      axisResults,
    },
    { headers: NO_STORE }
  );
}
