"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AssessmentLimitations from "@/components/AssessmentLimitations";

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

const RELATIONSHIP_LINE =
  "This is not an assessment of relationship health or compatibility, and it is not a substitute for counseling or other professional relationship support.";

export default function CompareHome() {
  const [items, setItems] = useState<Summary[] | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/compare/api/comparisons", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { comparisons: [] }))
      .then((data) => setItems(data.comparisons))
      .catch(() => setItems([]));
  }, []);
  useEffect(load, [load]);

  async function call(url: string, init: RequestInit, done?: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json" },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) setMessage(body.error ?? "Something went wrong.");
      else if (done) setMessage(done);
      return res.ok;
    } finally {
      setBusy(false);
      load();
    }
  }

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    const ok = await call(
      "/compare/api/comparisons",
      { method: "POST", body: JSON.stringify({ email }) },
      "Invitation created. We don't email it yet, so ask them to sign in to Continua and open Compare."
    );
    if (ok) setEmail("");
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
  const ended = (items ?? []).filter((c) => c.status === "declined" || c.status === "revoked");

  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Your Continua</p>
      <h1 className="mt-2 text-4xl font-bold text-white">Compare</h1>
      <p className="mt-3 text-lg text-white/80">
        See your profile next to someone else&apos;s. Both of you have to agree, and either of you can end it at
        any time.
      </p>

      <div className="mt-6">
        <AssessmentLimitations />
        <p className="mt-3 rounded-xl bg-white/70 p-4 text-sm text-foreground">{RELATIONSHIP_LINE}</p>
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
              <p className="mt-2 text-sm text-foreground/75">
                If you accept, you will each see both profiles side by side, using your most recent
                assessments. Nothing is shown until you accept. Either of you can end the comparison at any
                time, and it disappears for both of you.
              </p>
              <p className="mt-2 text-sm text-foreground/60">{RELATIONSHIP_LINE}</p>
              <div className="mt-4 flex gap-3">
                <button
                  disabled={busy}
                  onClick={() => respond(c.id, "accept")}
                  className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground disabled:opacity-60"
                >
                  Accept
                </button>
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
          <h2 className="text-xl font-bold text-white">Comparisons</h2>
          {active.map((c) => (
            <div key={c.id} className="glass-card mt-3 flex items-center justify-between gap-3 p-5">
              <Link href={`/compare/${c.id}`} className="font-bold underline underline-offset-4">
                You and {c.other.name}
              </Link>
              <button
                disabled={busy}
                onClick={() => end(c.id)}
                className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
              >
                End
              </button>
            </div>
          ))}
        </section>
      )}

      {waitingOnThem.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Waiting for them</h2>
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
            Their email address (the one they use to sign in to Continua)
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
          <p className="mt-3 text-sm text-foreground/70">
            If they accept, they will see your most recent assessment, and you will see theirs. You need to
            have taken an assessment first. Either of you can end the comparison at any time.
          </p>
          <button
            type="submit"
            disabled={busy || !email}
            className="mt-4 rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground disabled:opacity-60"
          >
            Send invitation
          </button>
        </form>
      </section>

      {ended.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Ended</h2>
          {ended.map((c) => (
            <p key={c.id} className="glass-card mt-3 p-4 text-sm text-foreground/70">
              {c.other.name}: {c.status === "declined" ? "declined" : "ended"}
            </p>
          ))}
        </section>
      )}

      {items === null && <p className="mt-8 text-white/70">Loading…</p>}
    </main>
  );
}
