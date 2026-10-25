import type { Metadata } from "next";
import { Suspense } from "react";
import RaterFlow from "./rater-flow";

export const metadata: Metadata = {
  title: "Describe someone you know",
  description: "Answer a short Continua questionnaire about someone who asked how you see them.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function RatePage() {
  return (
    <Suspense fallback={<p className="mt-24 text-center text-white/70">Loading…</p>}>
      <RaterFlow />
    </Suspense>
  );
}
