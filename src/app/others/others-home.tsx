"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ObserverChart, { ChartLegend } from "@/components/observer/ObserverChart";
import { INVITE_NOTE_MAX } from "@/lib/comparison/invite-note";
import type { SubjectSummary } from "@/lib/observer/service";

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function OthersHome() {
  const [data, setData] = useState<SubjectSummary | null>(null);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/others/api", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => d && setData(d))
      .catch(() => setMessage("Could not load this page. Please refresh."));
  }, []);
  useEffect(load, [load]);

  async function call(url: string, init: RequestInit, done?: (body: Record<string, unknown>) => string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) setMessage(body.error ?? "Something went wrong.");
      else if (done) setMessage(done(body));
      return res.ok;
    } finally {
      setBusy(false);
      load();
    }
  }

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    const sentTo = email.trim();
    const ok = await call("/others/api", { method: "POST", body: JSON.stringify({ email, note }) }, (body) =>
      body.emailed
        ? `Invitation emailed to ${sentTo}.`
        : `The invitation was saved, but the email to ${sentTo} could not be sent. Cancel it below and try again later.`
    );
    if (ok) {
      setEmail("");
      setNote("");
    }
  }

  const remove = (id: string, what: string) => {
    if (!window.confirm(what)) return;
    call(`/others/api/${id}`, { method: "DELETE" });
  };
  const removeAnonymous = () => {
    if (!window.confirm("Delete all anonymous ratings of you? This can't be undone.")) return;
    call("/others/api/anonymous", { method: "DELETE" });
  };

  if (!data) {
    return (
      <main className="mx-auto max-w-[760px] px-6 py-16">
        <p className="text-white/70">{message ?? "Loading…"}</p>
      </main>
    );
  }

  const { view, self, pending } = data;
  const totalShown = view.named.length + view.anonymousShown;

  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Your Continua</p>
      <h1 className="mt-2 text-4xl font-bold text-white">How others see you</h1>
      <p className="mt-3 text-lg text-white/80">
        Ask people who know you to answer the same statements about you. You see where they place you on each axis
        next to where you place yourself. Each person chooses whether you see their name or only an anonymous average.
      </p>

      <aside className="mt-5 rounded-xl bg-white/70 px-4 py-3 text-[13px] leading-snug text-foreground/80">
        A self-reflection tool, not therapy or a clinical assessment. Ratings describe how particular people see you,
        often from one part of your life. Differences are information, not verdicts.{" "}
        <Link href="/methodology" className="font-semibold underline underline-offset-2">
          Methodology &amp; Limitations
        </Link>
      </aside>

      {message && <p className="glass-card mt-6 p-4 text-sm font-semibold text-foreground/80">{message}</p>}

      {!self && (
        <div className="glass-card mt-6 p-5">
          <p className="font-semibold">Take the assessment yourself first.</p>
          <p className="mt-1 text-sm text-foreground/70">
            People you invite answer the same questionnaire you took most recently, so your own result comes first.
          </p>
          <Link href="/quiz" className="mt-3 inline-block rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold">
            Take the assessment
          </Link>
        </div>
      )}

      {totalShown > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Where people place you</h2>
          {self && (
            <p className="mt-1 text-sm text-white/70">Your own rating is from your assessment of {fmt(self.takenAt)}.</p>
          )}
          {view.observations.length > 0 && (
            <ul className="glass-card mt-3 space-y-2 p-5 text-sm leading-relaxed text-foreground/85">
              {view.observations.map((o, i) => (
                <li key={i}>{o.text}</li>
              ))}
            </ul>
          )}
          <section className="glass-card mt-4 p-5">
            <ChartLegend named={view.named} anonymousShown={view.anonymousShown} />
            <div className="mt-4">
              <ObserverChart axes={view.axes} named={view.named} />
            </div>
          </section>
        </section>
      )}

      {view.anonymousHeldBack > 0 && (
        <p className="glass-card mt-4 p-4 text-sm text-foreground/75">
          One person answered anonymously. Anonymous answers are shown, as an average, once at least two people have
          chosen to answer that way.
        </p>
      )}

      {(view.named.length > 0 || view.anonymousShown > 0 || view.anonymousHeldBack > 0) && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">People who answered</h2>
          <div className="glass-card mt-3 divide-y divide-foreground/10 px-5">
            {view.named.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <p>
                  <b>{r.name}</b>
                  {r.email && <span className="text-sm text-foreground/60"> ({r.email})</span>}
                </p>
                <button
                  disabled={busy}
                  onClick={() => remove(r.id, `Delete ${r.name}'s rating of you? This can't be undone.`)}
                  className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            ))}
            {view.anonymousShown + view.anonymousHeldBack > 0 && (
              <div className="flex items-center justify-between gap-3 py-3">
                <p>{plural(view.anonymousShown + view.anonymousHeldBack, "anonymous rating", "anonymous ratings")}</p>
                <button
                  disabled={busy}
                  onClick={removeAnonymous}
                  className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
                >
                  Delete all anonymous
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Waiting for an answer</h2>
          <div className="glass-card mt-3 divide-y divide-foreground/10 px-5">
            {pending.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-3">
                <p>
                  <b>{p.email}</b>
                  <span className="text-sm text-foreground/60"> · invited {fmt(p.createdAt)}</span>
                </p>
                <button
                  disabled={busy}
                  onClick={() => remove(p.id, `Cancel the invitation to ${p.email}? Their link will stop working.`)}
                  className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/70">Unanswered invitations are deleted after 30 days.</p>
        </section>
      )}

      {self && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Invite someone</h2>
          <form onSubmit={invite} className="glass-card mt-3 p-5">
            <label htmlFor="observer-email" className="text-sm font-semibold">
              Their email address
            </label>
            <input
              id="observer-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-foreground/20 bg-white/80 px-3 py-2 text-foreground"
              placeholder="name@example.com"
            />
            <label htmlFor="observer-note" className="mt-4 block text-sm font-semibold">
              Add a personal note <span className="font-normal text-foreground/60">(optional)</span>
            </label>
            <textarea
              id="observer-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={INVITE_NOTE_MAX}
              rows={3}
              className="mt-2 w-full rounded-lg border border-foreground/20 bg-white/80 px-3 py-2 text-foreground"
              placeholder="I'd really value your honest view, even the parts I might not like."
            />
            <p className="mt-1 flex justify-between text-xs text-foreground/60">
              <span>Plain text. Links and email addresses can&apos;t be included.</span>
              <span>
                {note.length}/{INVITE_NOTE_MAX}
              </span>
            </p>
            <p className="mt-3 text-sm text-foreground/70">
              They get a private link, no account needed. They answer the questionnaire you took most recently, with
              &ldquo;Can&apos;t tell&rdquo; always available, and choose at the end whether you see their name. You
              see six scores from each person, never their individual answers.
            </p>
            <p className="mt-3 text-sm text-foreground/70">
              The invitation will come from <b>{data.myName}</b>.{" "}
              <Link href="/my-continua" className="font-semibold underline underline-offset-2">
                Change your name
              </Link>
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
      )}
    </main>
  );
}
