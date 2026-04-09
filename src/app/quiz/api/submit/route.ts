import { NextRequest, NextResponse } from "next/server";
import { ensureUser, storeResult } from "@/lib/quiz/db";
import { getQuestionnaire } from "@/lib/quiz/questionnaires";
import { calculateScores, getAxisLabel, AXIS_INFO } from "@/lib/quiz/scoring";
import { createShareLink } from "@/lib/quiz/share";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { questionnaireId, answers, anonymousToken } = body as {
    questionnaireId: number;
    answers: number[];
    anonymousToken: string;
  };

  if (!questionnaireId || !answers || !anonymousToken) {
    return NextResponse.json(
      { error: "Missing required fields" },
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

  if (answers.length !== questionnaire.questions.length) {
    return NextResponse.json(
      { error: "Answer count does not match question count" },
      { status: 400 }
    );
  }

  if (answers.some((a) => a < 1 || a > 5 || !Number.isInteger(a))) {
    return NextResponse.json(
      { error: "All answers must be integers between 1 and 5" },
      { status: 400 }
    );
  }

  const scores = calculateScores(answers, questionnaire.questions);

  const axisResults = Object.entries(scores).map(([key, score]) => {
    const axis = key as keyof typeof AXIS_INFO;
    return {
      axis,
      name: AXIS_INFO[axis].name,
      score,
      label: getAxisLabel(axis, score),
      highLabel: AXIS_INFO[axis].highLabel,
      lowLabel: AXIS_INFO[axis].lowLabel,
    };
  });

  const shareLink = createShareLink({
    score: scores.empathy,
    label: getAxisLabel("empathy", scores.empathy),
    questionnaireId,
  });

  await ensureUser(anonymousToken);
  const resultId = await storeResult(anonymousToken, questionnaireId, scores.empathy, scores);

  return NextResponse.json({
    resultId,
    scores,
    axisResults,
    shareLink,
  });
}
