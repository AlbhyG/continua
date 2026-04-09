import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/quiz/db";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("anonymous_token")?.value;

  if (!token) {
    return NextResponse.json({ results: [], average: null });
  }

  const history = await getHistory(token);
  return NextResponse.json(history);
}
