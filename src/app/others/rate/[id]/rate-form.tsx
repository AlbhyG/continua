"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Form = { subjectName: string; firstName: string; questions: string[]; options: { value: number; label: string }[] };

// A rater answers the subject's questions, written about the subject, with
// "Can't tell" always available, then chooses named or anonymous.
export default function RateForm({ id }: { id: string }) {
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [visibility, setVisibility] = useState<"named" | "anonymous" | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/others/api/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error ?? "This invitation isn't available.");
        return body as Form;
      })
      .then(setForm)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const total = form?.questions.length ?? 0;
  const answered = Object.keys(answers).length;
  const ready = form && answered === total && visibility !== null;

  async function submit() {
    if (!form || !ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/others/api/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: form.questions.map((_, i) => answers[i]), visibility }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Your answers could not be saved.");
        return;
      }
      setDone(true);
      window.scrollTo({ top: 0 });
    } finally {
      setBusy(false);
    }
  }

  if (done && form) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="glass-card p-6">
          <h1 className="text-2xl font-bold">Thank you</h1>
          <p className="mt-2 text-foreground/75">
            Your answers about {form.subjectName} are saved
            {visibility === "anonymous" ? " as part of an anonymous average." : " under your name."} You can
            withdraw them at any time from How Others See You.
          </p>
          <Link href="/others" className="mt-4 inline-block rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground">
            Go to How Others See You
          </Link>
        </div>
      </main>
    );
  }

  if (error && !form) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="glass-card p-6">
          <h1 className="text-2xl font-bold">Invitation not available</h1>
          <p className="mt-2 text-foreground/75">{error}</p>
          <p className="mt-2 text-sm text-foreground/60">
            Invitations work only when you sign in with the email address they were sent to.
          </p>
        </div>
      </main>
    );
  }

  if (!form) {
    return <p className="mx-auto mt-24 max-w-2xl px-6 text-white/70">Loading…</p>;
  }

  const name = form.firstName;
  return (
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-12">
      <h1 className="text-3xl font-bold text-foreground">How you see {form.subjectName}</h1>
      <p className="mt-2 text-foreground/75">
        Answer from your own experience of {name}. There are no right answers, and &quot;Can&apos;t tell&quot; is a
        good answer whenever you don&apos;t know, for example about something you&apos;ve never seen {name} in.
      </p>

      <div className="fixed top-[57px] left-0 right-0 z-40">
        <div className="h-[3px] w-full bg-black/10">
          <div className="h-full bg-foreground/50 transition-all duration-300" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {form.questions.map((q, index) => (
          <div key={index} className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-foreground/40">
              Question {index + 1} of {total}
            </div>
            <p className="mb-4 text-base leading-relaxed text-foreground">{q}</p>
            <div className="flex flex-col gap-2">
              {form.options.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setAnswers((prev) => ({ ...prev, [index]: o.value }))}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm transition-all ${
                    answers[index] === o.value
                      ? "bg-foreground font-bold text-white"
                      : o.value === 0
                        ? "bg-white/40 text-foreground/65 hover:bg-white/80"
                        : "bg-white/60 text-foreground/80 hover:bg-white/90"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <fieldset className="mt-8 rounded-xl bg-white/80 p-5 shadow-sm">
        <legend className="sr-only">Named or anonymous</legend>
        <p className="font-bold text-foreground">How should {name} see your answers?</p>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { v: "named" as const, title: "With my name", text: `${name} sees your scores labeled with your name.` },
            {
              v: "anonymous" as const,
              title: "Anonymously",
              text: `${name} sees your scores only averaged with other anonymous answers, and only once there are at least two.`,
            },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setVisibility(o.v)}
              className={`rounded-lg px-4 py-3 text-left text-sm transition-all ${
                visibility === o.v ? "bg-foreground text-white" : "bg-white/60 text-foreground/80 hover:bg-white/90"
              }`}
            >
              <b>{o.title}.</b> {o.text}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-foreground/60">
          In a small group, {name} may still be able to guess who said what, even when answers are anonymous. You
          can withdraw your answers at any time.
        </p>
      </fieldset>

      <div className="mt-8 pb-8">
        {error && <p className="mb-3 text-sm font-semibold text-red-700">{error}</p>}
        <button
          onClick={submit}
          disabled={!ready || busy}
          className={`w-full rounded-xl px-4 py-4 text-sm font-bold transition-all ${
            busy ? "cursor-wait bg-white/90 text-foreground" : ready ? "bg-white/90 text-foreground hover:bg-white" : "cursor-not-allowed bg-white/30 text-foreground/30"
          }`}
        >
          {busy ? "Saving…" : "Submit"}
        </button>
        {!ready && (
          <p className="mt-3 text-center text-sm text-foreground/50">
            {answered < total
              ? `Answer all ${total} questions to continue (${total - answered} to go)`
              : "Choose whether to be named or anonymous"}
          </p>
        )}
      </div>
    </div>
  );
}
