import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Methodology & Limitations',
  description: 'What Continua assessment results can and cannot tell you, and the limits of this self-reflection framework.',
}

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 pb-12 pt-12">
      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Methodology &amp; Limitations</h1>
      <p className="mt-4 text-base leading-relaxed">
        Draft disclosure · September 14, 2026. This language is pending legal review, not legal sign-off.
      </p>

      <div className="mt-8 space-y-9 rounded-2xl bg-white/90 p-6 text-lg leading-relaxed sm:p-8">
        <section aria-labelledby="what-results-mean">
          <h2 id="what-results-mean" className="mb-3 text-2xl font-bold">What results mean</h2>
          <p>
            Continua is a personality framework and self-report questionnaire intended for self-reflection and discussion.
            It has not been clinically validated as a diagnostic or therapeutic instrument.
            Results reflect how you or another participant answered a set of questions at one point in time,
            not a fixed or complete description of anyone’s personality.
          </p>
          <p>
            The assessment summarizes answers across six dimensions: Social Attunement, Empathy,
            Self-Orientation, Conscientiousness, Agency, and Reactivity. The current questionnaire
            maps responses onto scores from 1 to 10. A score is a summary of answers, not a diagnosis,
            a percentile, or a ranking of a person’s worth. Neither end of an axis is inherently better.
          </p>
        </section>

        <section aria-labelledby="professional-support">
          <h2 id="professional-support" className="mb-3 text-2xl font-bold">Not a substitute for professional support</h2>
          <p>
            Continua is not therapy, counseling, or a medical or mental health service, and using it—alone
            or with someone else—is not a substitute for care from a licensed professional. If you or
            someone you’re discussing results with is dealing with a mental health concern, relationship
            distress, or anything else that would benefit from professional support, please seek that support directly.
          </p>
        </section>

        <section aria-labelledby="descriptions">
          <h2 id="descriptions" className="mb-3 text-2xl font-bold">How descriptions are produced</h2>
          <p>
            Current assessment results use calculated scores and predefined labels. The planned
            whole-profile AI descriptions are not available yet. They are intended to draw on
            reviewed source material and undergo automated checks; those checks and the required
            validation have not been released. We are not claiming that current results pass that future review process.
          </p>
          <p>
            Any future generated descriptions should avoid diagnostic language and claims that one
            result is better or worse than another. This page will need to be updated and reviewed
            before those features launch.
          </p>
        </section>

        <section aria-labelledby="range">
          <h2 id="range" className="mb-3 text-2xl font-bold">Repeated assessments and observed range</h2>
          <p>
            Answers may differ between occasions. A future range display is planned to summarize
            your own saved sessions and state how many sessions it uses. That display is not available yet.
            Where a range is eventually shown, a small number of sessions will produce a rough observation,
            not a precise measurement or a prediction of every situation.
          </p>
          <p>
            Variation between answers within one questionnaire is not, by itself, evidence of how
            someone changes across different contexts. A middle score also does not establish a wide observed range.
          </p>
        </section>

        <section aria-labelledby="comparisons">
          <h2 id="comparisons" className="mb-3 text-2xl font-bold">Discussing results with another person</h2>
          <p>
            Comparing self-reported tendencies is not a measure of relationship health, compatibility,
            or either person’s character. Results should not be treated as evidence for decisions
            about a relationship, employment, or anything else consequential.
          </p>
          <p>
            A dedicated two-person comparison feature with mutual consent is planned but is not
            available yet. Do not assume the existing individual-result sharing control provides
            those planned consent or revocation protections.
          </p>
        </section>

        <nav aria-label="Related information" className="flex flex-wrap gap-x-6 gap-y-3 border-t border-black/15 pt-6 text-base font-semibold">
          <Link href="/quiz" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Assessment overview</Link>
          <Link href="/privacy" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Privacy policy</Link>
        </nav>
      </div>
    </main>
  )
}
