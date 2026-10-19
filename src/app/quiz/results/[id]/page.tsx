"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { scoresToOrbData } from "@/lib/quiz/orb-mapping";
import AssessmentLimitations from "@/components/AssessmentLimitations";

const RadarProfile = dynamic(
  () => import("@/components/quiz/RadarProfile"),
  {
    ssr: false,
    loading: () => <div className="h-[350px] flex items-center justify-center text-white/30 text-sm">Loading chart...</div>,
  }
);

const PersonalityOrb = dynamic(
  () => import("@/components/PersonalityOrb"),
  {
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center text-white/30 text-sm">Generating orb...</div>,
  }
);

interface AxisResult {
  axis: string;
  name: string;
  score: number;
  label: string;
  highLabel: string;
  lowLabel: string;
}

interface ResultData {
  scores: Record<string, number>;
  axisResults: AxisResult[];
  activeShareCount?: number;
  canShare?: boolean;
  personId?: string | null;
  personName?: string | null;
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id;

  const [result, setResult] = useState<ResultData | null>(null);
  const [shareStatus, setShareStatus] = useState<
    "idle" | "working" | "copied" | "manual" | "stopped" | "error"
  >("idle");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [activeShares, setActiveShares] = useState(0);
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "working" | "error" | "sign_in"
  >("idle");
  const [loadError, setLoadError] = useState<"not_found" | "unavailable" | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${resultId}`);
    if (stored) {
      setResult(JSON.parse(stored));
      return;
    }
    fetch(`/quiz/api/results/${resultId}`)
      .then((res) => {
        if (res.status === 403 || res.status === 404) {
          // Stale or inaccessible result: stop the header from pointing at it again.
          if (localStorage.getItem("latest_result_id") === String(resultId)) {
            localStorage.removeItem("latest_result_id");
            window.dispatchEvent(new Event("continua:latest-result"));
          }
          setLoadError("not_found");
          return null;
        }
        if (!res.ok) {
          setLoadError("unavailable");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setResult(data);
      })
      .catch(() => setLoadError("unavailable"));
  }, [resultId]);

  useEffect(() => {
    if (result) setActiveShares(result.activeShareCount ?? 0);
  }, [result]);

  function rememberShareCount(count: number) {
    setActiveShares(count);
    try {
      const key = `result_${resultId}`;
      const stored = sessionStorage.getItem(key);
      if (stored) {
        sessionStorage.setItem(
          key,
          JSON.stringify({ ...JSON.parse(stored), activeShareCount: count })
        );
      }
    } catch {
      // Session storage is a convenience only.
    }
  }

  async function takeAnother() {
    const personQuery = result?.personId
      ? `?person=${encodeURIComponent(result.personId)}`
      : "";
    const res = await fetch(`/quiz/api/random${personQuery}`);
    if (!res.ok) {
      const data = await res.json();
      if (data.error === "all_completed") {
        alert("You've completed all available questionnaires!");
        return;
      }
      return;
    }
    const { id } = await res.json();
    const next = new URLSearchParams();
    if (result?.personId) next.set("person", result.personId);
    if (result?.personName) next.set("name", result.personName);
    router.push(`/quiz/take/${id}${next.size ? `?${next.toString()}` : ""}`);
  }

  // A link is created only when the owner asks to share. It carries a random
  // token, not the scores, so it stops working when sharing is turned off or
  // the result is deleted.
  async function shareResult() {
    if (!result || shareStatus === "working") return;
    setShareStatus("working");
    setShareUrl(null);

    const urlPromise: Promise<string> = fetch(
      `/quiz/api/results/${resultId}/share`,
      { method: "POST" }
    )
      .then((res) => {
        if (!res.ok) throw new Error("share_failed");
        return res.json();
      })
      .then((data: { shareLink: string }) => window.location.origin + data.shareLink);

    try {
      // Passing the pending URL to ClipboardItem keeps the copy inside the
      // click gesture, which Safari requires.
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": urlPromise.then(
              (url) => new Blob([url], { type: "text/plain" })
            ),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(await urlPromise);
      }
      setShareUrl(await urlPromise);
      setShareStatus("copied");
      rememberShareCount(activeShares + 1);
      setTimeout(
        () => setShareStatus((s) => (s === "copied" ? "idle" : s)),
        2500
      );
    } catch {
      try {
        // The link was made but could not be copied; show it instead.
        setShareUrl(await urlPromise);
        setShareStatus("manual");
        rememberShareCount(activeShares + 1);
      } catch {
        setShareStatus("error");
      }
    }
  }

  async function stopSharing() {
    const res = await fetch(`/quiz/api/results/${resultId}/share`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setShareStatus("error");
      return;
    }
    rememberShareCount(0);
    setShareUrl(null);
    setShareStatus("stopped");
  }

  async function deleteResult() {
    const message =
      activeShares > 0
        ? "Delete this result permanently? Links you've shared will stop working. This cannot be undone."
        : "Delete this result permanently? This cannot be undone.";
    if (!window.confirm(message)) return;

    setDeleteStatus("working");
    const res = await fetch(`/quiz/api/results/${resultId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setDeleteStatus(data?.error === "sign_in_required" ? "sign_in" : "error");
      return;
    }

    try {
      sessionStorage.removeItem(`result_${resultId}`);
      if (localStorage.getItem("latest_result_id") === String(resultId)) {
        localStorage.removeItem("latest_result_id");
        window.dispatchEvent(new Event("continua:latest-result"));
      }
    } catch {
      // Browser storage is a convenience only.
    }
    router.push("/quiz?deleted=1");
  }

  if (!result && loadError) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-foreground">
          {loadError === "not_found"
            ? "We couldn't find this result."
            : "Results are temporarily unavailable."}
        </p>
        <p className="text-sm text-foreground/60">
          {loadError === "not_found"
            ? "Results are tied to the browser or account you used to take the assessment. If you took it in a different browser or before signing in, it won't show up here."
            : "Please try again in a few minutes."}
        </p>
        <Link
          href="/quiz"
          className="mt-2 rounded-xl bg-white/90 px-6 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-white"
        >
          Take the Assessment
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-foreground/70">Loading result...</p>
      </div>
    );
  }

  const orbData = scoresToOrbData(result.scores);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-foreground">Your Personality Graph</h1>
      {result.personName && (
        <p className="mt-1 text-sm font-semibold text-foreground/70">
          Assessment for {result.personName}
        </p>
      )}
      <p className="mt-2 text-foreground/60 text-sm">
        Your coordinates across 6 personality dimensions
      </p>

      {/* Personality Orb */}
      <div className="mt-6"><AssessmentLimitations /></div>
      <div className="mt-8 flex justify-center">
        <PersonalityOrb data={orbData} size={280} />
      </div>

      {/* Radar chart */}
      <div className="mt-8 rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm">
        <RadarProfile data={result.axisResults} />
      </div>

      {/* Axis detail bars */}
      <div className="mt-6 flex flex-col gap-3">
        {result.axisResults.map((ar) => (
          <div key={ar.axis} className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-foreground/80">{ar.name}</span>
              <span className="text-sm text-foreground/50">{ar.score}</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-foreground/10">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-foreground/40 transition-all duration-500"
                style={{ width: `${((ar.score - 1) / 9) * 100}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-foreground/40">
              <span>{ar.lowLabel}</span>
              <span>{ar.highLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={takeAnother}
          className="w-full rounded-xl bg-white/90 px-4 py-4 text-sm font-bold text-foreground transition-all hover:bg-white shadow-sm"
        >
          Take Another Assessment
        </button>
        {result.canShare !== false && (
          <>
        <button
          onClick={shareResult}
          disabled={shareStatus === "working"}
          className="w-full rounded-xl bg-white/40 px-4 py-4 text-sm font-bold text-foreground transition-all hover:bg-white/60 disabled:opacity-60"
        >
          {shareStatus === "working"
            ? "Creating Link..."
            : shareStatus === "copied"
              ? "Link Copied!"
              : "Share Result"}
        </button>
        {shareStatus === "manual" && shareUrl && (
          <div className="rounded-xl bg-white/60 p-3 text-xs text-foreground/70">
            <p className="mb-2">Copy this link to share your result:</p>
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg bg-white px-3 py-2 text-xs text-foreground"
            />
          </div>
        )}
        {shareStatus === "error" && (
          <p className="text-center text-xs text-foreground/60">
            Something went wrong. Please try again.
          </p>
        )}
        {activeShares > 0 ? (
          <div className="rounded-xl bg-white/30 p-4 text-center text-xs text-foreground/60">
            <p>
              Anyone with a link to this result can see these scores until you
              stop sharing or delete the result.
            </p>
            <button
              onClick={stopSharing}
              className="mt-2 font-bold text-foreground/80 underline underline-offset-2 hover:text-foreground"
            >
              Stop sharing (turn off all links)
            </button>
          </div>
        ) : (
          shareStatus === "stopped" && (
            <p className="text-center text-xs text-foreground/60">
              Sharing is off. Links to this result no longer work.
            </p>
          )
        )}
          </>
        )}
        <Link
          href="/famous-figures"
          className="w-full rounded-xl bg-white/40 px-4 py-4 text-center text-sm font-bold text-foreground transition-all hover:bg-white/60"
        >
          Famous Archetypal Figures
        </Link>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={deleteResult}
          disabled={deleteStatus === "working"}
          className="text-xs font-semibold text-foreground/60 underline underline-offset-4 hover:text-foreground disabled:cursor-wait disabled:opacity-50"
        >
          {deleteStatus === "working" ? "Deleting…" : "Delete this result"}
        </button>
        {deleteStatus === "error" && (
          <p className="mt-2 text-xs text-foreground/60">
            Could not delete this result. Please try again.
          </p>
        )}
        {deleteStatus === "sign_in" && (
          <p className="mt-2 text-xs text-foreground/60">
            This result is saved to an account. Sign in to that account to delete it.
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-[10px] text-foreground/40">
        Take the assessment in different contexts to see how your coordinates shift.
        The book recommends quarterly reassessments.
      </p>
    </div>
  );
}
