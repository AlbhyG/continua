import Link from "next/link";

// One short note for the comparison screens, replacing two stacked boxes. It
// keeps the required points: a self-reflection tool (not therapy or a clinical
// assessment), not a measure of relationship health or compatibility, not a
// substitute for professional support, and self-reported tendencies only.
export default function CompareDisclaimer() {
  return (
    <aside
      aria-label="About this comparison"
      className="rounded-xl bg-white/70 px-4 py-3 text-[13px] leading-snug text-foreground/80"
    >
      A self-reflection tool, not therapy or a clinical assessment, and not a substitute for professional
      support. Results describe self-reported tendencies, not compatibility, relationship health, or anyone&apos;s
      character.{" "}
      <Link href="/methodology" className="font-semibold underline underline-offset-2">
        Methodology &amp; Limitations
      </Link>
    </aside>
  );
}
