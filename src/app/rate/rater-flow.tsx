"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Question = { text: string; direction: string };
type View =
  | { state: "open"; subjectName: string; questions: Question[] }
  | { state: "completed"; subjectName: string };
type Stage = "intro" | "questions" | "about" | "done" | "withdrawn";

const RELATIONSHIPS = [
  { value: "partner", label: "Partner or spouse" },
  { value: "family", label: "Family" },
  { value: "friend", label: "Friend" },
  { value: "coworker", label: "Coworker" },
  { value: "other", label: "Other" },
];
const KNOWN_FOR = [
  { value: "under_1", label: "Less than a year" },
  { value: "1_to_5", label: "1 to 5 years" },
  { value: "5_to_15", label: "5 to 15 years" },
  { value: "over_15", label: "More than 15 years" },
];

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "them";

// Same five answers as the self assessment (values unchanged, so scoring
// matches), plus "Can't tell", stored as 0 and left out of the score.
function options(first: string) {
  return [
    { value: 1, label: `Very much like ${first}` },
    { value: 2, label: `Mostly like ${first}` },
    { value: 3, label: `Kind of like ${first}` },
    { value: 4, label: `Mostly not like ${first}` },
    { value: 5, label: `Not like ${first} at all` },
    { value: 0, label: "Can't tell" },
  ];
}

const card = "rounded-xl bg-white/85 backdrop-blur-sm p-5 shadow-sm";
const primary =
  "rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-white transition hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-40";
const quiet = "text-sm font-semibold text-foreground/70 underline underline-offset-4 disabled:opacity-50";

export default function RaterFlow() {
  const token = useSearchParams().get("t") ?? "";
  const [view, setView] = useState<View | null>(null);
  const [missing, setMissing] = useState(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [named, setNamed] = useState<boolean | null>(null);
  // What the rater chose on the first screen, before answering. Kept for
  // research; they can still change it at the end.
  const [initialNamed, setInitialNamed] = useState<boolean | null>(null);
  const [changingChoice, setChangingChoice] = useState(false);
  const [raterName, setRaterName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [knownFor, setKnownFor] = useState("");
  const [researchConsent, setResearchConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setMissing(true);
      return;
    }
    fetch(`/rate/api?t=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: View) => {
        setView(data);
        if (data.state === "completed") setStage("done");
      })
      .catch(() => setMissing(true));
  }, [token]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage]);

  async function post(url: string, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      return res.ok;
    } finally {
      setBusy(false);
    }
  }

  async function withdraw(kind: "decline" | "withdraw") {
    const msg =
      kind === "decline"
        ? "Decline this invitation? It will be deleted."
        : "Withdraw your answers? They will be deleted and removed from what they see.";
    if (!window.confirm(msg)) return;
    if (await post("/rate/api/withdraw", {})) setStage("withdrawn");
  }

  async function submit() {
    if (!view || view.state !== "open") return;
    const ordered = view.questions.map((_, i) => answers[i]);
    const ok = await post("/rate/api/submit", {
      answers: ordered,
      named,
      initialNamed,
      raterName: named ? raterName : null,
      relationship,
      knownFor,
      researchConsent,
    });
    if (ok) setStage("done");
  }

  if (missing) {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-20 pb-12">
        <div className={card}>
          <h1 className="text-2xl font-bold">This link isn&apos;t working</h1>
          <p className="mt-2 text-foreground/70">
            It may have expired (invitations last 30 days), been withdrawn, or been copied only in part. If someone
            asked you to describe them, ask them to send a new invitation.
          </p>
        </div>
      </main>
    );
  }
  if (!view) return <p className="mt-24 text-center text-white/70">Loading…</p>;

  const name = view.subjectName;
  const first = firstName(name);

  if (stage === "withdrawn") {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-20 pb-12">
        <div className={card}>
          <h1 className="text-2xl font-bold">Done</h1>
          <p className="mt-2 text-foreground/70">The invitation and any answers have been deleted.</p>
        </div>
      </main>
    );
  }

  if (stage === "done") {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-20 pb-12">
        <div className={card}>
          <h1 className="text-2xl font-bold">Thank you</h1>
          <p className="mt-2 text-foreground/75">
            Your answers about {name} are saved. They will see them only as six overall scores, combined as you chose.
          </p>
          <p className="mt-3 text-foreground/75">
            You can withdraw your answers at any time by opening this same link.
          </p>
          <p className="mt-3 text-foreground/75">
            Curious how you see yourself?{" "}
            <Link href="/quiz" className="font-semibold underline underline-offset-2">
              Take the assessment
            </Link>
            .
          </p>
          {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
          <button className={`${quiet} mt-5`} disabled={busy} onClick={() => withdraw("withdraw")}>
            Withdraw my answers
          </button>
        </div>
      </main>
    );
  }

  const questions = view.state === "open" ? view.questions : [];
  const opts = options(first);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const allCantTell = allAnswered && Object.values(answers).every((a) => a === 0);

  if (stage === "intro") {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-20 pb-12">
        <h1 className="text-3xl font-bold text-white">{name} would like to know how you see them</h1>
        <div className={`${card} mt-6 space-y-3 text-foreground/80`}>
          <p>
            You&apos;ll read {questions.length} short statements about {first} and say how well each one describes
            them. If you don&apos;t know, choose <b>Can&apos;t tell</b>. That&apos;s useful too. It takes about five
            minutes, and you don&apos;t need an account.
          </p>
          <p>
            <b>What {first} will see:</b> six overall scores, never your answer to any single statement. You can
            withdraw your answers at any time using this same link.
          </p>
          <p className="text-sm text-foreground/65">
            Continua is a self-reflection tool based on the book <i>Continua: How Opposites Align</i>. It is not a
            clinical assessment, and your answers describe how you see {first}, not who they are.{" "}
            <Link href="/methodology" className="font-semibold underline underline-offset-2">
              Methodology &amp; Limitations
            </Link>
          </p>
        </div>
        <div className={`${card} mt-5`}>
          <NameChoice first={first} named={named} onChange={setNamed} />
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-white">{error}</p>}
        <div className="mt-6 flex items-center gap-5">
          <button
            className={primary}
            disabled={named === null}
            onClick={() => {
              setInitialNamed(named);
              setStage("questions");
            }}
          >
            Start
          </button>
          <button className="text-sm font-semibold text-white underline underline-offset-4" disabled={busy} onClick={() => withdraw("decline")}>
            No thanks
          </button>
        </div>
      </main>
    );
  }

  if (stage === "questions") {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-20 pb-12">
        <h1 className="text-3xl font-bold text-white">How well does each statement describe {first}?</h1>
        <p className="mt-2 text-white/80">Go with your sense of how {first} usually is. There are no right answers.</p>

        <div className="fixed top-[57px] left-0 right-0 z-40">
          <div className="h-[3px] w-full bg-black/10">
            <div
              className="h-full bg-foreground/50 transition-all duration-300"
              style={{ width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          {questions.map((q, index) => (
            <fieldset key={index} className={card}>
              <legend className="sr-only">Statement {index + 1}</legend>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-foreground/40">
                Statement {index + 1} of {questions.length}
              </div>
              <p className="mb-4 text-base leading-relaxed text-foreground">{q.text}</p>
              <div className="flex flex-col gap-2">
                {opts.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={answers[index] === o.value}
                    onClick={() => setAnswers((prev) => ({ ...prev, [index]: o.value }))}
                    className={`rounded-lg px-4 py-2.5 text-left text-sm transition-all ${
                      answers[index] === o.value
                        ? "bg-foreground font-bold text-white"
                        : o.value === 0
                          ? "bg-white/40 italic text-foreground/70 hover:bg-white/80"
                          : "bg-white/60 text-foreground/80 hover:bg-white/90"
                    } ${o.value === 0 ? "mt-1" : ""}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-8 pb-8">
          <button
            className="w-full rounded-xl bg-white/90 px-4 py-4 text-sm font-bold text-foreground shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-foreground/30"
            disabled={!allAnswered || allCantTell}
            onClick={() => setStage("about")}
          >
            Continue
          </button>
          <p className="mt-3 text-center text-sm text-white/80">
            {!allAnswered
              ? `Answer all ${questions.length} statements to continue (${answeredCount} done)`
              : allCantTell
                ? "Please answer at least some statements other than “Can't tell”."
                : "Next: two quick questions about how you know them."}
          </p>
        </div>
      </main>
    );
  }

  // stage === "about"
  const cleanName = raterName.trim();
  const ready = named !== null && initialNamed !== null && (!named || cleanName.length > 0) && relationship && knownFor;
  return (
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-12">
      <h1 className="text-3xl font-bold text-white">Almost done</h1>

      <div className={`${card} mt-6`}>
        <h2 className="text-lg font-bold">How do you know {first}?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {RELATIONSHIPS.map((r) => (
            <button
              key={r.value}
              type="button"
              aria-pressed={relationship === r.value}
              onClick={() => setRelationship(r.value)}
              className={`rounded-full px-4 py-2 text-sm ${relationship === r.value ? "bg-foreground font-bold text-white" : "bg-white/70 text-foreground/80 hover:bg-white"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <h2 className="mt-5 text-lg font-bold">How long have you known them?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {KNOWN_FOR.map((k) => (
            <button
              key={k.value}
              type="button"
              aria-pressed={knownFor === k.value}
              onClick={() => setKnownFor(k.value)}
              className={`rounded-full px-4 py-2 text-sm ${knownFor === k.value ? "bg-foreground font-bold text-white" : "bg-white/70 text-foreground/80 hover:bg-white"}`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`${card} mt-5`}>
        {changingChoice ? (
          <NameChoice first={first} named={named} onChange={setNamed} atEnd />
        ) : (
          <p className="text-foreground/85">
            {named ? (
              <>
                You chose to <b>show your name</b> with your scores.
              </>
            ) : (
              <>
                You chose to be included <b>only in an anonymous average</b>.
              </>
            )}{" "}
            <button type="button" className="font-semibold underline underline-offset-2" onClick={() => setChangingChoice(true)}>
              Change
            </button>
          </p>
        )}
        {named && (
          <div className="mt-4">
            <label htmlFor="rater-name" className="text-sm font-semibold">
              Your name as {first} will see it
            </label>
            <input
              id="rater-name"
              value={raterName}
              maxLength={60}
              onChange={(e) => setRaterName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-foreground/20 bg-white/85 px-3 py-2 text-foreground"
              placeholder="First name is fine"
            />
          </div>
        )}
      </div>

      <div className={`${card} mt-5`}>
        <label className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={researchConsent}
            onChange={(e) => setResearchConsent(e.target.checked)}
          />
          <span className="text-sm text-foreground/80">
            <b>Optional:</b> Continua may use my answers, without my name or email address, in research on how people
            see each other.
          </span>
        </label>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-white/85 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-6 flex items-center gap-5">
        <button className={primary} disabled={!ready || busy} onClick={submit} aria-busy={busy}>
          {busy ? "Saving…" : "Submit"}
        </button>
        <button className="text-sm font-semibold text-white underline underline-offset-4" onClick={() => setStage("questions")}>
          Back to the statements
        </button>
      </div>
    </main>
  );
}

// The named-or-anonymous choice. Shown on the first screen, so raters know
// how their answers will be shown while they answer, with nothing
// pre-selected, and again at the end if they want to change it.
function NameChoice({
  first,
  named,
  onChange,
  atEnd = false,
}: {
  first: string;
  atEnd?: boolean;
  named: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-bold">Should {first} see your name?</legend>
      <p className="mt-1 text-sm text-foreground/75">
        {atEnd
          ? "Your answers are saved only when you submit, so you can still switch."
          : "Choose now so you know how your answers will be shown while you answer. You can change your mind at the end, before you submit."}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <label className={`flex cursor-pointer gap-3 rounded-lg p-3 ${named === true ? "bg-white" : "bg-white/50"}`}>
          <input type="radio" name="named" className="mt-1" checked={named === true} onChange={() => onChange(true)} />
          <span>
            <b>Show my name with my scores</b>
            <span className="block text-sm text-foreground/70">
              {first} sees your six scores labeled with your name and how you know them.
            </span>
          </span>
        </label>
        <label className={`flex cursor-pointer gap-3 rounded-lg p-3 ${named === false ? "bg-white" : "bg-white/50"}`}>
          <input type="radio" name="named" className="mt-1" checked={named === false} onChange={() => onChange(false)} />
          <span>
            <b>Include me only in an anonymous average</b>
            <span className="block text-sm text-foreground/70">
              Your scores are shown only as an average with at least one other person who also chose anonymous. If no
              one else does, {first} won&apos;t see your answers at all. So if you may be the only person {first} asked,
              a partner for example, anonymous means your answers go unseen.
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
