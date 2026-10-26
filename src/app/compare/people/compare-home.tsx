"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CompareDisclaimer from "@/components/compare/CompareDisclaimer";
import { INVITE_NOTE_MAX } from "@/lib/comparison/invite-note";

type Summary = {
  id: string;
  status: "pending" | "active" | "declined" | "revoked";
  iAmInitiator: boolean;
  other: { name: string; email: string };
  needsMyResponse: boolean;
  waitingOnThem: boolean;
  canView: boolean;
  createdAt: string;
};

export default function CompareHome() {
  const [items, setItems] = useState<Summary[] | null>(null);
  const [hasResult, setHasResult] = useState(true);
  const [myName, setMyName] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/compare/api/comparisons", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { comparisons: [], hasResult: true }))
      .then((data) => {
        setItems(data.comparisons);
        setHasResult(data.hasResult !== false);
        setMyName(typeof data.myName === "string" ? data.myName : null);
      })
      .catch(() => setItems([]));
  }, []);
  useEffect(load, [load]);

  async function call(
    url: string,
    init: RequestInit,
    done?: string | ((body: Record<string, unknown>) => string)
  ) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json" },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) setMessage(body.error ?? "Something went wrong.");
      else if (done) setMessage(typeof done === "function" ? done(body) : done);
      return res.ok;
    } finally {
      setBusy(false);
      load();
    }
  }

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    const sentTo = email.trim();
    const ok = await call(
      "/compare/api/comparisons",
      { method: "POST", body: JSON.stringify({ email, note }) },
      (body) =>
        body.emailed
          ? `Invitation emailed to ${sentTo}.`
          : `Invitation saved, but the email could not be sent. Ask ${sentTo} to sign in to Continua with that address and open ${String(body.link ?? "Compare")}.`
    );
    if (ok) {
      setEmail("");
      setNote("");
    }
  }

  const respond = (id: string, action: "accept" | "decline") =>
    call(`/compare/api/comparisons/${id}/respond`, { method: "POST", body: JSON.stringify({ action }) });
  const end = (id: string) => {
    if (!window.confirm("End this comparison? It disappears for both of you right away.")) return;
    call(`/compare/api/comparisons/${id}`, { method: "DELETE" });
  };

  const waitingForMe = (items ?? []).filter((c) => c.needsMyResponse);
  const active = (items ?? []).filter((c) => c.canView);
  const waitingOnThem = (items ?? []).filter((c) => c.waitingOnThem);

  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Your Continua</p>
      <h1 className="mt-2 text-4xl font-bold text-white">Comparisons</h1>
      <p className="mt-3 text-lg text-white/80">
        Open a comparison you already have, or invite someone new. Each of you takes the assessment
        yourself, nothing is shown until both of you agree, and either of you can end it at any time.
      </p>

      <div className="mt-5">
        <CompareDisclaimer />
      </div>

      {message && <p className="glass-card mt-6 p-4 text-sm font-semibold text-foreground/80">{message}</p>}

      {waitingForMe.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Waiting for your answer</h2>
          {waitingForMe.map((c) => (
            <div key={c.id} className="glass-card mt-3 p-5">
              <p className="font-bold">
                {c.other.name} ({c.other.email}) would like to compare with you.
              </p>
              {hasResult ? (
                <p className="mt-2 text-sm text-foreground/75">
                  If you accept, you will each see both results side by side. The comparison always uses
                  each person&apos;s most recent assessment, including any taken later. Nothing is shown until
                  you accept. Either of you can end the comparison at any
                  time, and it disappears for both of you.
                  {myName && (
                    <>
                      {" "}
                      You will appear to them as <b>{myName}</b> (
                      <Link href="/my-continua" className="underline underline-offset-2">
                        change
                      </Link>
                      ).
                    </>
                  )}
                </p>
              ) : (
                <p className="mt-2 text-sm text-foreground/75">
                  First take the assessment yourself. Your answers are private. After you see your result,
                  come back here and choose whether to compare with {c.other.name}.
                </p>
              )}
              <div className="mt-4 flex gap-3">
                {hasResult ? (
                  <button
                    disabled={busy}
                    onClick={() => respond(c.id, "accept")}
                    className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground disabled:opacity-60"
                  >
                    Accept and compare
                  </button>
                ) : (
                  <Link
                    href="/quiz"
                    className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground"
                  >
                    Take the assessment
                  </Link>
                )}
                <button
                  disabled={busy}
                  onClick={() => respond(c.id, "decline")}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-foreground/70 underline underline-offset-4 disabled:opacity-60"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {active.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">
            {active.length === 1 ? "Your comparison" : "Your comparisons"}
          </h2>
          {active.map((c) => (
            <div key={c.id} className="glass-card mt-3 flex items-center justify-between gap-3 p-5">
              <Link href={`/compare/${c.id}`} className="font-bold underline underline-offset-4">
                You and {c.other.name}
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href={`/compare/${c.id}`}
                  className="rounded-xl bg-white/90 px-4 py-2 text-sm font-bold text-foreground"
                >
                  View
                </Link>
                <button
                  disabled={busy}
                  onClick={() => end(c.id)}
                  className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
                >
                  End
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {waitingOnThem.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">
            {waitingOnThem.length === 1 ? "Invitation you sent" : "Invitations you sent"}
          </h2>
          {waitingOnThem.map((c) => (
            <div key={c.id} className="glass-card mt-3 flex items-center justify-between gap-3 p-5">
              <p>
                Invitation to <b>{c.other.email}</b>. Nothing is shown until they accept.
              </p>
              <button
                disabled={busy}
                onClick={() => end(c.id)}
                className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          ))}
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white">Invite someone</h2>
        <form onSubmit={invite} className="glass-card mt-3 p-5">
          <label htmlFor="invite-email" className="text-sm font-semibold">
            Their email address
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-foreground/20 bg-white/80 px-3 py-2 text-foreground"
            placeholder="name@example.com"
          />
          <label htmlFor="invite-note" className="mt-4 block text-sm font-semibold">
            Add a personal note <span className="font-normal text-foreground/60">(optional)</span>
          </label>
          <textarea
            id="invite-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={INVITE_NOTE_MAX}
            rows={3}
            className="mt-2 w-full rounded-lg border border-foreground/20 bg-white/80 px-3 py-2 text-foreground"
            placeholder="Hi, this is the project I mentioned. I'd love to compare."
          />
          <p className="mt-1 flex justify-between text-xs text-foreground/60">
            <span>Plain text. Links and email addresses can&apos;t be included.</span>
            <span>
              {note.length}/{INVITE_NOTE_MAX}
            </span>
          </p>
          <p className="mt-3 text-sm text-foreground/70">
            We&apos;ll email them an invitation. They take the assessment themselves, see their own result,
            and then choose whether to take part. If they do, you will each see the other&apos;s most recent
            assessment, including any taken later. Either of you can end the comparison at any time.
          </p>
          {myName && (
            <p className="mt-3 text-sm text-foreground/70">
              The invitation will come from <b>{myName}</b>.{" "}
              <Link href="/my-continua" className="font-semibold underline underline-offset-2">
                Change your name
              </Link>
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !email}
            className="mt-4 rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground disabled:opacity-60"
          >
            Send invitation
          </button>
        </form>
      </section>

      {items === null && <p className="mt-8 text-white/70">Loading…</p>}
    </main>
  );
}
