import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'
import { relationshipSections } from '@/lib/relationship-content'

export const metadata: Metadata = {
  title: 'About | Continua',
  description:
    'Learn how Continua helps people understand themselves, their relationships, and archetypal personality patterns.',
}

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-4">
            About
          </h1>
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/80">
            Continua provides tools for leveraging and optimizing relationships
            with others and with yourself.
          </p>
        </FadeIn>
      </section>

      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12 space-y-6">
        <FadeIn>
          <div className="glass-card p-8">
            <h2 className="text-[24px] md:text-[30px] font-bold mb-4">
              Understand Others
            </h2>
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85">
              Continua shows how personality differences can become a source of
              complementarity for individuals, couples, families, and teams.
            </p>
          </div>
        </FadeIn>

        {relationshipSections.map((section, i) => (
          <FadeIn key={section.title} delay={(i + 1) * 80}>
            <div className="glass-card p-8">
              <h2 className="text-[22px] md:text-[26px] font-bold mb-4">
                {section.title}
              </h2>
              <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85">
                {section.body}
              </p>
            </div>
          </FadeIn>
        ))}

        <FadeIn delay={450}>
          <div className="glass-card p-8">
            <h2 className="text-[22px] md:text-[26px] font-bold mb-4">
              Famous Archetypal Figures
            </h2>
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85 mb-5">
              Explore public figures often associated with the extreme ends of
              Continua&apos;s personality spectra.
            </p>
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
