"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Question {
  text: string;
  direction: string;
}

interface Questionnaire {
  id: number;
  questions: Question[];
}

const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly Agree" },
  { value: 2, label: "Agree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Disagree" },
  { value: 5, label: "Strongly Disagree" },
];

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = Number(params.id);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/quiz/api/questionnaire/${questionnaireId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load questionnaire");
        return res.json();
      })
      .then(setQuestionnaire)
      .catch(() => setError("Could not load this questionnaire."));
  }, [questionnaireId]);

  function setAnswer(questionIndex: number, value: number) {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  }

  const allAnswered =
    questionnaire &&
    Object.keys(answers).length === questionnaire.questions.length;

  async function handleSubmit() {
    if (!questionnaire || !allAnswered) return;
    setSubmitting(true);

    const token = localStorage.getItem("anonymous_token");
    if (!token) {
      setError("No anonymous token found. Please return to the quiz page.");
      setSubmitting(false);
      return;
    }

    const orderedAnswers = questionnaire.questions.map((_, i) => answers[i]);

    const res = await fetch("/quiz/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionnaireId: questionnaire.id,
        answers: orderedAnswers,
        anonymousToken: token,
      }),
    });

    if (!res.ok) {
      setError("Failed to submit quiz. Please try again.");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    sessionStorage.setItem(`result_${data.resultId}`, JSON.stringify(data));
    router.push(`/quiz/results/${data.resultId}`);
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-white/70">{error}</p>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-white/70">Loading questionnaire...</p>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Empathy–Detachment Assessment
        </h1>
        <p className="mt-2 text-white/60">
          Answer each statement honestly. There are no right or wrong answers.
        </p>
      </div>

      {/* Progress bar — thin, sticky, full-width */}
      <div className="sticky top-0 z-50 -mx-6 mt-8">
        <div className="h-1 w-full bg-white/5">
          <div
            className="h-full bg-white/40 transition-all duration-300"
            style={{
              width: `${(answeredCount / questionnaire.questions.length) * 100}%`,
            }}
          />
        </div>
        <div className="px-6 py-1 text-right text-[10px] text-white/30">
          {answeredCount}/{questionnaire.questions.length}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {questionnaire.questions.map((question, index) => (
          <div
            key={index}
            className="rounded-xl bg-white/5 border border-white/10 p-5"
          >
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-white/40">
              Question {index + 1} of {questionnaire.questions.length}
            </div>
            <p className="mb-4 text-base leading-relaxed text-white/90">
              {question.text}
            </p>
            <div className="flex flex-col gap-2">
              {LIKERT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAnswer(index, option.value)}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm transition-all ${
                    answers[index] === option.value
                      ? "bg-white font-bold text-black"
                      : "bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pb-8">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className={`w-full rounded-xl px-4 py-4 text-sm font-bold transition-all ${
            allAnswered && !submitting
              ? "bg-white/90 text-black hover:bg-white"
              : "cursor-not-allowed bg-white/10 text-white/30"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Answers"}
        </button>
        {!allAnswered && (
          <p className="mt-3 text-center text-sm text-white/40">
            Answer all {questionnaire.questions.length} questions to continue
          </p>
        )}
      </div>
    </div>
  );
}
