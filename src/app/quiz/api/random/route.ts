import { NextRequest, NextResponse } from "next/server";
import { getCompletedIds, getCompletedIdsForPerson } from "@/lib/quiz/db";
import { getRandomUncompletedId } from "@/lib/quiz/questionnaires";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("anonymous_token")?.value;
  const requestedPersonId = request.nextUrl.searchParams.get("person");

  if (requestedPersonId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "sign_in_required" }, { status: 403 });
    }

    const { data: person } = await supabase
      .from("people")
      .select("id")
      .eq("id", requestedPersonId)
      .eq("owner_user_id", user.id)
      .single();

    if (!person) {
      return NextResponse.json({ error: "person_not_found" }, { status: 404 });
    }

    const completedIds = await getCompletedIdsForPerson(person.id, supabase);
    const id = getRandomUncompletedId(completedIds);
    return id === null
      ? NextResponse.json({ error: "all_completed" }, { status: 404 })
      : NextResponse.json({ id });
  }

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
