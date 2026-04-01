import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'My Info | Continua',
  description: 'Understand your personality patterns across different contexts. Take assessments, see results, and get personalized insights with Continua.'
}

export default function MyInfoPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-foreground">
            My Info
          </h1>
        </FadeIn>
      </section>

      {/* Content */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12 space-y-8">
        <FadeIn>
          <div>
            <h2 className="text-[22px] md:text-[26px] font-bold mb-4 text-foreground">Take Assessments</h2>
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85">
              Continua will offer hundreds of different assessment variations you can take whenever you want. Maybe you take one at work on a stressful Monday, another at home on a relaxed Sunday evening, and a third while traveling. Each snapshot captures where you are in that moment, and over time, these assessments build a rich picture of your personality patterns.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div>
            <h2 className="text-[22px] md:text-[26px] font-bold mb-4 text-foreground">See Your Results</h2>
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85">
              All your assessments are collected in one place, and you can view them in whatever way makes sense for what you&rsquo;re exploring. Sort by date, by location, by cohorts or by tasks. Generate colorful Personality Orbs and charts that show visually where you are at a glance.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div>
            <h2 className="text-[22px] md:text-[26px] font-bold mb-4 text-foreground">Tools and Actions</h2>
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85">
              Within each dimension, you can set specific goals and get personalized recommendations tailored to you. Whether you&rsquo;re working on individual growth, strengthening a relationship, improving family dynamics, or optimizing team performance, Continua provides actionable strategies.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <div>
            <h2 className="text-[22px] md:text-[26px] font-bold mb-4 text-foreground">Extreme Examples</h2>
            <Link
              href="/famous-figures"
              className="inline-block px-6 py-3 rounded-xl bg-accent text-white text-[16px] font-semibold hover:bg-accent/90 transition-colors"
            >
              Famous Archetypal Figures
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
