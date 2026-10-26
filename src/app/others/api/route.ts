import { NextRequest, NextResponse } from "next/server";
import { displayNameFor, normEmail } from "@/lib/comparison/service";
import { cleanInviteNote } from "@/lib/comparison/invite-note";
import { createInvite, summaryForSubject } from "@/lib/observer/service";
import { sendObserverInvite } from "@/lib/email/send-observer-invite";
import { getSubject, NO_STORE } from "./auth";

// My invitations, my self-rating, and how the people who answered see me.
export async function GET() {
  const got = await getSubject();
  if ("error" in got) return got.error;
  const summary = await summaryForSubject(got.db, got.actor);
  return NextResponse.json(summary, { headers: NO_STORE });
}

// Invite someone (by email) to describe me.
export async function POST(request: NextRequest) {
  const got = await getSubject();
  if ("error" in got) return got.error;
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email ?? "");
  const note = cleanInviteNote(body?.note);
  if (!note.ok) {
    return NextResponse.json({ error: note.error }, { status: 400, headers: NO_STORE });
  }
  const result = await createInvite(got.db, got.actor, email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  // Same site the invitation was made on (production or a preview). The token
  // is shown only in this email, never to the person who sent it.
  const link = `${request.nextUrl.origin}/rate?t=${result.token}`;
  const emailed = await sendObserverInvite({
    inviterName: await displayNameFor(got.db, got.actor.id, got.actor.email),
    inviterEmail: got.actor.email,
    inviteeEmail: normEmail(email),
    link,
    note: note.note,
  });
  return NextResponse.json({ id: result.id, emailed }, { headers: NO_STORE });
}
