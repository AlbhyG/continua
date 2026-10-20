import Link from 'next/link'

export default function AssessmentLimitations() {
  return (
    <aside aria-label="Assessment limitations" className="rounded-xl bg-white/80 p-5 text-sm leading-relaxed text-foreground">
      <p>
        This is a self-reflection tool, not therapy or a clinical assessment.
        It isn’t a substitute for professional mental health or relationship support.
      </p>
      <Link href="/methodology" className="mt-3 inline-block font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">
        Methodology &amp; Limitations
      </Link>
    </aside>
  )
}
