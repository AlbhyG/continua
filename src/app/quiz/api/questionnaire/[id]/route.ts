import { NextRequest, NextResponse } from "next/server";
import { getQuestionnaire } from "@/lib/quiz/questionnaires";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const questionnaireId = Number(id);

  if (isNaN(questionnaireId)) {
    return NextResponse.json(
      { error: "Invalid questionnaire ID" },
      { status: 400 }
    );
  }

  const questionnaire = getQuestionnaire(questionnaireId);
  if (!questionnaire) {
    return NextResponse.json(
      { error: "Questionnaire not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: questionnaire.id,
    questions: questionnaire.questions.map((q) => ({
      text: q.text,
      direction: q.direction,
    })),
  });
}
