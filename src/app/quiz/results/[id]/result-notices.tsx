"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ResultData } from "./use-result";

const noticeClass = "mt-6 rounded-xl bg-white/80 p-4 text-center text-sm text-foreground shadow-sm";
const noticeLinkClass = "mt-2 block text-base font-bold underline underline-offset-4";

// Someone invited to compare is asked to decide after seeing their own result.
export function ComparisonInviteNotice({ result }: { result: ResultData }) {
  const [invitedBy, setInvitedBy] = useState<string[]>([]);

  useEffect(() => {
    const ownSignedIn =
      result.signedIn !== false && result.isOwner !== false && result.canShare !== false;
    if (!ownSignedIn) return;
    let cancelled = false;
    fetch("/compare/api/comparisons", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const names = (data.comparisons ?? [])
          .filter((c: { needsMyResponse?: boolean }) => c.needsMyResponse)
          .map((c: { other: { name: string } }) => c.other.name);
        setInvitedBy(names);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [result]);

  if (invitedBy.length === 0) return null;
  return (
    <div className={noticeClass}>
      <p>
        <span className="font-bold">{invitedBy.join(", ")} invited you to compare results.</span>{" "}
        Now that you have seen your result, you can choose whether to share it.
      </p>
      <Link href="/compare/people" className={noticeLinkClass}>
        Decide now
      </Link>
    </div>
  );
}

// A result taken without signing in lives only in this browser until the
// person signs in, when it is attached to their account.
export function SignInToKeepNotice({ result, resultId }: { result: ResultData; resultId: string }) {
  if (result.signedIn !== false || result.isOwner === false) return null;
  return (
    <div className={noticeClass}>
      <p>
        <span className="font-bold">Saved in this browser only.</span> Sign in to see it on any
        device and track how it changes over time.
      </p>
      <a
        href={`/login?next=${encodeURIComponent(`/quiz/results/${resultId}`)}`}
        onClick={() => {
          // Make the page ask the server again after sign-in, which is when the
          // result is attached to the account.
          try {
            sessionStorage.removeItem(`result_${resultId}`);
          } catch {
            // Browser storage is a convenience only.
          }
        }}
        className={noticeLinkClass}
      >
        Sign in to save it
      </a>
    </div>
  );
}
