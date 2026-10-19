"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setLatestResult } from "./use-result";

// "Delete this result", with a confirmation that mentions shared links if any.
export default function DeleteResult({ resultId, activeShares }: { resultId: string; activeShares: number }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "working" | "error" | "sign_in">("idle");

  async function deleteResult() {
    const message =
      activeShares > 0
        ? "Delete this result permanently? Links you've shared will stop working. This cannot be undone."
        : "Delete this result permanently? This cannot be undone.";
    if (!window.confirm(message)) return;

    setStatus("working");
    const res = await fetch(`/quiz/api/results/${resultId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setStatus(data?.error === "sign_in_required" ? "sign_in" : "error");
      return;
    }

    try {
      sessionStorage.removeItem(`result_${resultId}`);
      if (localStorage.getItem("latest_result_id") === resultId) setLatestResult(null);
    } catch {
      // Browser storage is a convenience only.
    }
    router.push("/quiz?deleted=1");
  }

  return (
    <div className="mt-3 text-center">
      <button
        onClick={deleteResult}
        disabled={status === "working"}
        className="text-sm font-bold text-foreground/70 underline underline-offset-4 hover:text-foreground disabled:cursor-wait disabled:opacity-50"
      >
        {status === "working" ? "Deleting…" : "Delete this result"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-xs text-foreground/60">Could not delete this result. Please try again.</p>
      )}
      {status === "sign_in" && (
        <p className="mt-2 text-xs text-foreground/60">
          This result is saved to an account. Sign in to that account to delete it.
        </p>
      )}
    </div>
  );
}
