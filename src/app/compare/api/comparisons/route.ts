import { NextRequest, NextResponse } from "next/server";
import {
  createComparison,
  displayNameFor,
  hasOwnResult,
  listForUser,
  normEmail,
} from "@/lib/comparison/service";
import { sendComparisonInvite } from "@/lib/email/send-comparison-invite";
import { getActor, NO_STORE } from "../auth";

// List my comparisons and invitations, and whether I have a result of my own yet.
export async function GET() {
  const got = await getActor();
  if ("error" in got) return got.error;
  const [comparisons, hasResult] = await Promise.all([
    listForUser(got.db, got.actor),
    hasOwnResult(got.db, got.actor.id),
  ]);
  return NextResponse.json({ comparisons, hasResult }, { headers: NO_STORE });
}

// Invite someone (by email) to compare. Nothing is shown until they accept.
export async function POST(request: NextRequest) {
  const got = await getActor();
  if ("error" in got) return got.error;
  const body = await request.json().catch(() => ({}));
  const inviteeEmail = String(body?.email ?? "");
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
  });
  return NextResponse.json({ id: result.id, emailed, link }, { headers: NO_STORE });
}
