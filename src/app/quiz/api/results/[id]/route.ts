import { NextRequest, NextResponse } from "next/server";
import { getResultById } from "@/lib/quiz/db";
import { getAxisLabel, AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import { createShareLink } from "@/lib/quiz/share";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const resultId = Number(id);
  const token = request.cookies.get("anonymous_token")?.value;

  if (isNaN(resultId)) {
    return NextResponse.json({ error: "Invalid result ID" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const row = await getResultById(resultId, token);
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

  const shareLink = createShareLink({
    score: scores.empathy,
    label: getAxisLabel("empathy", scores.empathy),
    questionnaireId: row.questionnaire_id,
  });

  return NextResponse.json({
    resultId: row.id,
    scores,
    axisResults,
    shareLink,
  });
}
