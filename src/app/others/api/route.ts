import { NextRequest, NextResponse } from "next/server";
import { displayNameFor, normEmail } from "@/lib/comparison/service";
import { cleanInviteNote } from "@/lib/comparison/invite-note";
import { createRatingInvite, raterView, subjectView } from "@/lib/ratings/service";
import { sendRatingInvite } from "@/lib/email/send-rating-invite";
import { getActor, NO_STORE } from "@/app/compare/api/auth";

// Everything the signed-in person needs for the How Others See You page:
// their own results from raters, and any requests for them to rate someone.
export async function GET() {
  const got = await getActor();
  if ("error" in got) return got.error;
  const [mine, asRater, myName] = await Promise.all([
    subjectView(got.db, got.actor),
    raterView(got.db, got.actor),
    displayNameFor(got.db, got.actor.id, got.actor.email),
  ]);
  return NextResponse.json({ mine, asRater, myName }, { headers: NO_STORE });
}

// Invite someone (by email) to rate you.
export async function POST(request: NextRequest) {
  const got = await getActor();
  if ("error" in got) return got.error;
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email ?? "");
  const note = cleanInviteNote(body?.note);
  if (!note.ok) return NextResponse.json({ error: note.error }, { status: 400, headers: NO_STORE });
  const result = await createRatingInvite(got.db, got.actor, email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  const link = `${request.nextUrl.origin}/others/rate/${result.id}`;
  const emailed = await sendRatingInvite({
    subjectName: await displayNameFor(got.db, got.actor.id, got.actor.email),
    subjectEmail: got.actor.email,
    raterEmail: normEmail(email),
    link,
    note: note.note,
  });
  return NextResponse.json({ id: result.id, emailed, link }, { headers: NO_STORE });
}
