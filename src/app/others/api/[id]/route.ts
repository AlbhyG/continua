import { NextResponse } from "next/server";
import { isUuid } from "@/lib/comparison/service";
import { ratingForm, removeNamed, submitRating, withdraw } from "@/lib/ratings/service";
import { getActor, NO_STORE } from "@/app/compare/api/auth";

const NOT_FOUND = () =>
  NextResponse.json({ error: "Not found." }, { status: 404, headers: NO_STORE });

// The questions for a rater, written about the person being rated.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NOT_FOUND();
  const got = await getActor();
  if ("error" in got) return got.error;
  const r = await ratingForm(got.db, got.actor, id);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: NO_STORE });
  return NextResponse.json(r.form, { headers: NO_STORE });
}

// Submit a rating.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NOT_FOUND();
  const got = await getActor();
  if ("error" in got) return got.error;
  const body = await request.json().catch(() => ({}));
  const r = await submitRating(got.db, got.actor, id, body?.answers, body?.visibility);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: NO_STORE });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

// ?as=rater withdraws your own rating (or declines an invitation);
// ?as=subject removes a named rating of you.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NOT_FOUND();
  const got = await getActor();
  if ("error" in got) return got.error;
  const as = new URL(request.url).searchParams.get("as");
  const r = as === "subject" ? await removeNamed(got.db, got.actor, id) : await withdraw(got.db, got.actor, id);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: NO_STORE });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
