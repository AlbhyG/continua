import { NextRequest, NextResponse } from "next/server";
import { resolveShareLink } from "@/lib/quiz/share";
import { getExplanation, getAxisLabel, AXIS_INFO } from "@/lib/quiz/scoring";
import { createAdminClient } from "@/lib/supabase/admin";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("t");

  // Links made before revocable sharing carried the scores in the URL itself.
  // They are no longer honored, so they cannot outlive a deleted result.
  if (!token && (searchParams.has("data") || searchParams.has("sig"))) {
    return NextResponse.json(
      { error: "legacy_link" },
      { status: 410, headers: NO_STORE }
    );
  }
  if (!token) {
    return NextResponse.json(
      { error: "missing_token" },
      { status: 400, headers: NO_STORE }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "unavailable" },
      { status: 503, headers: NO_STORE }
    );
  }

  const shared = await resolveShareLink(token, admin);
  if (!shared) {
    return NextResponse.json(
      { error: "not_available" },
      { status: 404, headers: NO_STORE }
    );
  }

  const scores = shared.scores;
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
  const empathy = scores?.empathy ?? shared.score;

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
