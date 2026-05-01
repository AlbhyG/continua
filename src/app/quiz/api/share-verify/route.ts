import { NextRequest, NextResponse } from "next/server";
import { verifyShareLink } from "@/lib/quiz/share";
import { getExplanation, getAxisLabel, AXIS_INFO } from "@/lib/quiz/scoring";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");
  const sig = searchParams.get("sig");

  if (!data || !sig) {
    return NextResponse.json(
      { error: "Missing data or signature" },
      { status: 400 }
    );
  }

  const payload = verifyShareLink(data, sig);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or tampered share link" },
      { status: 403 }
    );
  }

  const axisResults = payload.scores
    ? (Object.entries(payload.scores) as [keyof typeof AXIS_INFO, number][]).map(
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

  return NextResponse.json({
    score: payload.score,
    label: payload.label,
    explanation: getExplanation(payload.score),
    scores: payload.scores ?? null,
    axisResults,
  });
}
