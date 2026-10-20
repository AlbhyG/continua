import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'My Relationships | Continua (v1)',
  description: 'Understand personality patterns in your relationships. See how Continua helps couples, families, and teams transform differences into complementarity.'
}

const sections = [
  {
    title: 'For Individuals',
    body: 'Continua shows you your patterns across different situations and contexts. Understanding these shifts gives you insight into how you operate in the world. You\u2019ll identify growth opportunities that matter to you, make better decisions about which environments bring out your best self, and build self-awareness that goes beyond labels.',
  },
  {
    title: 'For Couples',
    body: 'When you can see exactly where your personalities align and diverge, those differences stop feeling like incompatibility and start looking like complementarity. Continua shows you how your partner\u2019s \u201Copposite\u201D traits can balance and strengthen your relationship.',
  },
  {
    title: 'For Families',
    body: 'Every family member brings different personality dynamics to the table. Understand the dynamics and take advantage of the psychological diversity. Children grow and circumstances change. Track how dynamics shift and adapt appropriately.',
  },
  {
    title: 'For Teams',
    body: 'The best teams aren\u2019t made up of similar people\u2014they\u2019re balanced across personality dimensions. Assess whether your team has the range needed for a specific project, assign roles that match people\u2019s strengths, and identify gaps before they become problems.',
  },
]

export default function V1MyRelationshipsPage() {
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
        {sections.map((section, i) => (
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
              <Link href="/v1/my-info" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors">
                My Info
              </Link>{' '}
              to explore personality assessments and your personal profile.
            </p>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
