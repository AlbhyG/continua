import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'
import { relationshipSections } from '@/lib/relationship-content'

export const metadata: Metadata = {
  title: 'My Relationships | Continua',
  description: 'Understand personality patterns in your relationships. See how Continua helps couples, families, and teams transform differences into complementarity.'
}

export default function MyRelationshipsPage() {
  return (
    <div>
      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-4">
            My Relationships
          </h1>
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/80">
            We will provide tools for leveraging and optimizing relationships with others and with yourself.
          </p>
        </FadeIn>
      </section>

      {/* Content cards */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12 space-y-6">
        {relationshipSections.map((section, i) => (
          <FadeIn key={section.title} delay={i * 100}>
            <div className="glass-card p-8">
              <h2 className="text-[22px] md:text-[26px] font-bold mb-4">{section.title}</h2>
              <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85">
                {section.body}
              </p>
            </div>
          </FadeIn>
        ))}

        <FadeIn delay={400}>
          <div className="glass-card p-6">
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/75 italic">
              Want to learn more about yourself? Check out{' '}
              <Link href="/my-info" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors">
                Info
              </Link>{' '}
              to explore personality assessments and your personal profile.
            </p>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
