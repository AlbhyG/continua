import { NextRequest, NextResponse } from "next/server";
import {
  countOwnResults,
  createComparison,
  displayNameFor,
  hasOwnResult,
  listForUser,
  normEmail,
} from "@/lib/comparison/service";
import { cleanInviteNote } from "@/lib/comparison/invite-note";
import { sendComparisonInvite } from "@/lib/email/send-comparison-invite";
import { getActor, NO_STORE } from "../auth";

// List my comparisons and invitations, and whether I have a result of my own yet.
export async function GET() {
  const got = await getActor();
  if ("error" in got) return got.error;
  const [comparisons, hasResult, myName, resultCount] = await Promise.all([
    listForUser(got.db, got.actor),
    hasOwnResult(got.db, got.actor.id),
    displayNameFor(got.db, got.actor.id, got.actor.email),
    countOwnResults(got.db, got.actor.id),
  ]);
  return NextResponse.json({ comparisons, hasResult, myName, resultCount }, { headers: NO_STORE });
}

// Invite someone (by email) to compare. Nothing is shown until they accept.
export async function POST(request: NextRequest) {
  const got = await getActor();
  if ("error" in got) return got.error;
  const body = await request.json().catch(() => ({}));
  const inviteeEmail = String(body?.email ?? "");
  // Check the note before creating anything, so a refused note doesn't leave
  // a half-made invitation behind.
  const note = cleanInviteNote(body?.note);
  if (!note.ok) {
    return NextResponse.json({ error: note.error }, { status: 400, headers: NO_STORE });
  }
  const result = await createComparison(got.db, got.actor, inviteeEmail);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }

  // The link goes to the same site the invitation was made on (production or a preview).
  const link = `${request.nextUrl.origin}/compare/people`;
  const emailed = await sendComparisonInvite({
    inviterName: await displayNameFor(got.db, got.actor.id, got.actor.email),
    inviterEmail: got.actor.email,
    inviteeEmail: normEmail(inviteeEmail),
    link,
    note: note.note,
  });
  return NextResponse.json({ id: result.id, emailed, link }, { headers: NO_STORE });
}
