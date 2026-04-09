import { NextRequest, NextResponse } from "next/server";
import { getResultById } from "@/lib/quiz/db";
import { getLabel, getExplanation } from "@/lib/quiz/scoring";
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

  const label = getLabel(row.score);
  const explanation = getExplanation(row.score);
  const shareLink = createShareLink({
    score: row.score,
    label,
    questionnaireId: row.questionnaire_id,
  });

  return NextResponse.json({
    resultId: row.id,
    score: row.score,
    label,
    explanation,
    shareLink,
  });
}
