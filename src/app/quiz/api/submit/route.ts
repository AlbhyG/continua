import { NextRequest, NextResponse } from "next/server";
import { ensureUser, storeResult } from "@/lib/quiz/db";
import { getQuestionnaire } from "@/lib/quiz/questionnaires";
import { calculateScores, getAxisLabel, AXIS_INFO } from "@/lib/quiz/scoring";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Assessments are always of the person taking them. (An earlier version let
  // signed-in users assess someone else; that was removed in October 2026.)
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ownedPersonId: string | null = null;
  let personName: string | null = null;
  if (user) {
    await supabase.rpc("ensure_current_user_records");
    const { data: person } = await supabase
      .from("people")
      .select("id,name")
      .eq("owner_user_id", user.id)
      .eq("is_self", true)
      .single();
    if (!person) {
      return NextResponse.json(
        { error: "Your account record is not available." },
        { status: 403 }
      );
    }
    ownedPersonId = person.id;
    personName = person.name;
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Quiz storage is not configured." },
      { status: 500 }
    );
  }

  await ensureUser(anonymousToken, admin);
  const resultId = await storeResult(
    anonymousToken,
    questionnaireId,
    scores.empathy,
    scores,
    {
      userId: user?.id ?? null,
      personId: ownedPersonId,
      supabase: admin,
    }
  );

  return NextResponse.json({
    resultId,
    scores,
    axisResults,
    activeShareCount: 0,
    canShare: true,
    signedIn: Boolean(user),
    personId: ownedPersonId,
    personName,
  });
}
