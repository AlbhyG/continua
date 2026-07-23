import { NextRequest, NextResponse } from "next/server";
import { getResultById } from "@/lib/quiz/db";
import { getAxisLabel, AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import { createShareLink } from "@/lib/quiz/share";
import { createClient } from "@/lib/supabase/server";

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

  if (isNaN(resultId)) {
    return NextResponse.json({ error: "Invalid result ID" }, { status: 400 });
  }

  if (!token && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const row = await getResultById(resultId, {
    anonymousToken: token,
    userId: user?.id,
    supabase,
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

  const shareLink = createShareLink({
    score: scores.empathy,
    label: getAxisLabel("empathy", scores.empathy),
    questionnaireId: row.questionnaire_id,
    scores,
  });

  return NextResponse.json({
    resultId: row.id,
    scores,
    axisResults,
    shareLink,
    personId: row.person_id,
  });
}
