import { NextRequest, NextResponse } from "next/server";
import { getCompletedIds } from "@/lib/quiz/db";
import { getRandomUncompletedId } from "@/lib/quiz/questionnaires";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("anonymous_token")?.value;

  if (!token) {
    const id = getRandomUncompletedId([]);
    if (id === null) {
      return NextResponse.json(
        { error: "No questionnaires available" },
        { status: 404 }
      );
    }
    return NextResponse.json({ id });
  }

  const completedIds = await getCompletedIds(token);
  const id = getRandomUncompletedId(completedIds);

  if (id === null) {
    return NextResponse.json({ error: "all_completed" }, { status: 404 });
  }

  return NextResponse.json({ id });
}
