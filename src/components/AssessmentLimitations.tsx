import Link from 'next/link'

// The disclaimer shown next to the assessment and its results. Its link goes
// to the same page as the footer's "Methodology & Limitations", but is worded
// as part of the notice so the two don't read as duplicates on short pages.
export default function AssessmentLimitations() {
  return (
    <aside aria-label="Assessment limitations" className="rounded-xl bg-white/80 p-5 text-sm leading-relaxed text-foreground">
      <p>
        This is a self-reflection tool, not therapy or a clinical assessment.
        It isn’t a substitute for professional mental health or relationship support.
      </p>
      <Link href="/methodology" className="mt-3 inline-block font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">
        How this assessment works, and its limits →
      </Link>
    </aside>
  )
}
