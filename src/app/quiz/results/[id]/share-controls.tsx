"use client";

import { useState } from "react";
import { updateStoredResult } from "./use-result";

type ShareStatus = "idle" | "working" | "copied" | "manual" | "stopped" | "error";

// Sharing state for one result. A link is created only when the owner asks to
// share. It carries a random token, not the scores, so it stops working when
// sharing is turned off or the result is deleted.
export function useSharing(resultId: string, initialActiveShares: number) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [activeShares, setActiveShares] = useState(initialActiveShares);

  function rememberShareCount(count: number) {
    setActiveShares(count);
    updateStoredResult(resultId, { activeShareCount: count });
  }

  async function share() {
    if (status === "working") return;
    setStatus("working");
    setShareUrl(null);

    const urlPromise: Promise<string> = fetch(`/quiz/api/results/${resultId}/share`, { method: "POST" })
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
            "text/plain": urlPromise.then((url) => new Blob([url], { type: "text/plain" })),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(await urlPromise);
      }
      setShareUrl(await urlPromise);
      setStatus("copied");
      rememberShareCount(activeShares + 1);
      setTimeout(() => setStatus((s) => (s === "copied" ? "idle" : s)), 2500);
    } catch {
      try {
        // The link was made but could not be copied; show it instead.
        setShareUrl(await urlPromise);
        setStatus("manual");
        rememberShareCount(activeShares + 1);
      } catch {
        setStatus("error");
      }
    }
  }

  async function stop() {
    const res = await fetch(`/quiz/api/results/${resultId}/share`, { method: "DELETE" });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    rememberShareCount(0);
    setShareUrl(null);
    setStatus("stopped");
  }

  return { status, shareUrl, activeShares, share, stop };
}

type Sharing = ReturnType<typeof useSharing>;

// The "Share Result" button, plus the copy-it-yourself box or an error when needed.
export function ShareButton({ sharing }: { sharing: Sharing }) {
  const { status, shareUrl, share } = sharing;
  return (
    <>
      <button
        onClick={share}
        disabled={status === "working"}
        className="w-full rounded-xl bg-white/40 px-4 py-4 text-sm font-bold text-foreground transition-all hover:bg-white/60 disabled:opacity-60"
      >
        {status === "working" ? "Creating Link..." : status === "copied" ? "Link Copied!" : "Share Result"}
      </button>
      {status === "manual" && shareUrl && (
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
      {status === "error" && (
        <p className="text-center text-xs text-foreground/60">Something went wrong. Please try again.</p>
      )}
    </>
  );
}

// "Stop sharing" while links are active; a confirmation once they are off.
export function StopSharing({ sharing }: { sharing: Sharing }) {
  const { activeShares, status, stop } = sharing;
  if (activeShares > 0) {
    return (
      <div className="text-center">
        <button
          onClick={stop}
          className="text-sm font-bold text-foreground/70 underline underline-offset-4 hover:text-foreground"
        >
          Stop sharing (turn off all links)
        </button>
        <p className="mt-1 text-[11px] text-foreground/50">
          Anyone with a link to this result can see these scores until you stop sharing or delete the
          result.
        </p>
      </div>
    );
  }
  if (status === "stopped") {
    return <p className="text-center text-sm text-foreground/60">Sharing is off. Links to this result no longer work.</p>;
  }
  return null;
}
