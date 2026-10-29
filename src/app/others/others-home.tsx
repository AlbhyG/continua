"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { INVITE_NOTE_MAX } from "@/lib/comparison/invite-note";
import { AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import OthersChart, { ANON_COLOR, RATER_COLORS, type AxisRow, type Source } from "@/components/others/OthersChart";
import PronounPicker from "./pronoun-picker";

type Scores = Record<string, number | null>;
type Mine = {
  self: { scores: AxisScores; takenAt: string } | null;
  pronoun: "he" | "she" | "they";
  invited: { email: string; invitedAt: string }[];
  named: { id: string; name: string; scores: Scores; submittedAt: string }[];
  anonymous: { count: number; average: Scores | null };
  axes: (AxisRow & { gap: number | null })[];
  notableGaps: (AxisRow & { gap: number | null })[];
};
type AsRater = {
  requests: { id: string; subjectName: string; invitedAt: string }[];
  given: { id: string; subjectName: string; visibility: string; submittedAt: string }[];
};

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));

function initials(names: string[]): string[] {
  const firsts = names.map((n) => (n.trim()[0] ?? "?").toUpperCase());
  return firsts.map((f, i) => (firsts.filter((x) => x === f).length > 1 ? `${f}${firsts.slice(0, i + 1).filter((x) => x === f).length}` : f));
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function OthersHome() {
  const [mine, setMine] = useState<Mine | null>(null);
  const [asRater, setAsRater] = useState<AsRater | null>(null);
  const [myName, setMyName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/others/api", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setMine(d.mine);
        setAsRater(d.asRater);
        setMyName(d.myName ?? "");
      });
  }, []);
  useEffect(load, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const sentTo = email.trim();
      const res = await fetch("/others/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentTo, note }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(body.error ?? "Something went wrong.");
        return;
      }
      setMessage(
        body.emailed
          ? `Invitation emailed to ${sentTo}.`
          : `Invitation saved, but the email could not be sent. Send ${sentTo} this link yourself: ${body.link}`
      );
      setEmail("");
      setNote("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, as: "rater" | "subject", confirmText: string) {
    if (busy || !window.confirm(confirmText)) return;
    setBusy(true);
    try {
      await fetch(`/others/api/${id}?as=${as}`, { method: "DELETE" });
      load();
    } finally {
      setBusy(false);
    }
  }

  const named = mine?.named ?? [];
  const tags = initials(named.map((n) => n.name));
  const sources: Source[] = [
    ...named.map((n, i) => ({
      key: n.id,
      label: n.name,
      short: tags[i],
      color: RATER_COLORS[i % RATER_COLORS.length],
      scores: n.scores,
    })),
    ...(mine?.anonymous.average
      ? [{ key: "anon", label: "Anonymous average", short: "Avg", color: ANON_COLOR, scores: mine.anonymous.average }]
      : []),
  ];
  const anyRatings = sources.length > 0;

  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Your Continua</p>
      <h1 className="mt-2 text-4xl font-bold text-white">How Others See You</h1>
      <p className="mt-3 text-lg text-white/80">
        Invite people who know you to answer the same questions about you. Their view sits next to your own, axis by
        axis. Differences aren&apos;t verdicts; they&apos;re places to ask a question.
      </p>

      {message && <p className="glass-card mt-6 break-words p-4 text-sm font-semibold text-foreground/80">{message}</p>}

      {mine === null && <p className="mt-10 text-white/70">Loading…</p>}

      {mine && !mine.self && (
        <div className="glass-card mt-8 p-6">
          <p className="font-bold">Take the assessment yourself first.</p>
          <p className="mt-2 text-sm text-foreground/75">
            The people you invite answer the same questions you answered, so you need a result of your own before
            you can invite anyone.
          </p>
          <Link href="/quiz" className="mt-4 inline-block rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground">
            Take the assessment
          </Link>
        </div>
      )}

      {mine?.self && (
        <>
          <section className="mt-8">
            <h2 className="text-xl font-bold text-white">{anyRatings ? "Your view and theirs" : "Your results"}</h2>
            {!anyRatings ? (
              <div className="glass-card mt-3 p-5 text-sm text-foreground/75">
                {mine.anonymous.count === 1
                  ? "One anonymous rating has come in. Anonymous ratings appear only as an average, once there are at least two, so it will show when another arrives."
                  : mine.invited.length > 0
                    ? "No ratings to show yet. They'll appear here as people respond."
                    : "Invite a few people below. Their ratings will appear here as they respond."}
              </div>
            ) : (
              <>
                {mine.notableGaps.length > 0 && (
                  <div className="glass-card mt-3 p-5">
                    <p className="font-bold">
                      {mine.notableGaps.length === 1 ? "Your biggest difference" : "Your biggest differences"}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                      {mine.notableGaps.slice(0, 3).map((g) => (
                        <li key={g.axis}>
                          <b>{AXIS_INFO[g.axis].name}:</b> others place you{" "}
                          {(g.gap as number) > 0 ? "higher" : "lower"} than you do ({g.self} vs {g.others})
                          {g.agree === true ? ", and they agree with one another." : g.agree === false ? ", but they don't agree with one another." : "."}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-foreground/60">
                      A gap is a place to ask a question, not a verdict. It may reflect a different part of your
                      range, the rater&apos;s own position, something they can&apos;t see, or something you
                      can&apos;t.
                    </p>
                  </div>
                )}
                <section className="glass-card mt-4 p-5">
                  <OthersChart rows={mine.axes} sources={sources} />
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-foreground/10 pt-3 text-xs text-foreground/75">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-3 w-3 rounded-full bg-[#1d7f6a]" /> You (assessment of {fmt(mine.self.takenAt)})
                    </span>
                    {sources.map((s) => (
                      <span key={s.key} className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-full" style={{ background: s.color }} /> {s.label}
                      </span>
                    ))}
                  </div>
                </section>
                {(named.length > 0 || mine.anonymous.count > 0) && (
                  <div className="glass-card mt-4 p-5 text-sm">
                    <p className="font-bold">Who has rated you</p>
                    <ul className="mt-2 space-y-2">
                      {named.map((n) => (
                        <li key={n.id} className="flex items-center justify-between gap-3">
                          <span>
                            {n.name} <span className="text-foreground/55">· {fmt(n.submittedAt)}</span>
                          </span>
                          <button
                            disabled={busy}
                            onClick={() => remove(n.id, "subject", `Remove ${n.name}'s rating? It will be deleted.`)}
                            className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                      {mine.anonymous.count > 0 && (
                        <li className="text-foreground/75">
                          {plural(mine.anonymous.count, "anonymous rating", "anonymous ratings")}
                          {mine.anonymous.count < 2 ? " (shown once there are at least two)" : ", shown as one average"}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-white">Invite someone to rate you</h2>
            <form onSubmit={invite} className="glass-card mt-3 p-5">
              <label htmlFor="rate-email" className="text-sm font-semibold">
                Their email address
              </label>
              <input
                id="rate-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-foreground/20 bg-white/80 px-3 py-2 text-foreground"
                placeholder="name@example.com"
              />
              <label htmlFor="rate-note" className="mt-4 block text-sm font-semibold">
                Add a personal note <span className="font-normal text-foreground/60">(optional)</span>
              </label>
              <textarea
                id="rate-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={INVITE_NOTE_MAX}
                rows={3}
                className="mt-2 w-full rounded-lg border border-foreground/20 bg-white/80 px-3 py-2 text-foreground"
                placeholder="I'm curious how I come across. Be honest."
              />
              <p className="mt-1 flex justify-between text-xs text-foreground/60">
                <span>Plain text. Links and email addresses can&apos;t be included.</span>
                <span>
                  {note.length}/{INVITE_NOTE_MAX}
                </span>
              </p>
              <p className="mt-3 text-sm text-foreground/70">
                They&apos;ll answer the same 36 questions you answered, written about you, and can choose
                &quot;Can&apos;t tell&quot; for anything they don&apos;t know. It takes about five to seven
                minutes. Each person chooses whether you see their answers under their name or only as part of an
                anonymous average.
              </p>
              <div className="mt-3 text-sm text-foreground/70">
                <PronounPicker initial={mine.pronoun} name={myName} />
              </div>
              <button
                type="submit"
                disabled={busy || !email}
                className="mt-4 rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground disabled:opacity-60"
              >
                Send invitation
              </button>
            </form>
            {mine.invited.length > 0 && (
              <div className="glass-card mt-4 p-5 text-sm">
                <p className="font-bold">{mine.invited.length === 1 ? "Invitation you've sent" : "Invitations you've sent"}</p>
                <ul className="mt-2 space-y-1 text-foreground/75">
                  {mine.invited.map((i) => (
                    <li key={i.email}>
                      {i.email} <span className="text-foreground/50">· {fmt(i.invitedAt)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-foreground/55">
                  To protect anonymous answers, this list doesn&apos;t show who has responded. Unanswered
                  invitations are deleted after 30 days.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {asRater && (asRater.requests.length > 0 || asRater.given.length > 0) && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Rating other people</h2>
          {asRater.requests.length > 0 && (
            <div className="glass-card mt-3 p-5 text-sm">
              <p className="font-bold">{asRater.requests.length === 1 ? "Someone has asked you" : "People have asked you"}</p>
              <ul className="mt-2 space-y-2">
                {asRater.requests.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3">
                    <span>{r.subjectName || "Someone"} would like to know how you see them.</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <Link href={`/others/rate/${r.id}`} className="rounded-xl bg-white/90 px-4 py-2 text-sm font-bold text-foreground">
                        Start
                      </Link>
                      <button
                        disabled={busy}
                        onClick={() => remove(r.id, "rater", "Decline this invitation? It will be deleted.")}
                        className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {asRater.given.length > 0 && (
            <div className="glass-card mt-3 p-5 text-sm">
              <p className="font-bold">{asRater.given.length === 1 ? "Rating you've given" : "Ratings you've given"}</p>
              <ul className="mt-2 space-y-2">
                {asRater.given.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-3">
                    <span>
                      {g.subjectName || "Someone"}{" "}
                      <span className="text-foreground/55">
                        · {g.visibility === "anonymous" ? "anonymous" : "named"} · {fmt(g.submittedAt)}
                      </span>
                    </span>
                    <button
                      disabled={busy}
                      onClick={() => remove(g.id, "rater", "Withdraw your rating? It will be deleted.")}
                      className="text-xs font-semibold text-foreground/60 underline underline-offset-4 disabled:opacity-60"
                    >
                      Withdraw
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
