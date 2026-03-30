import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'
import MyRelationshipsActions from '@/components/MyRelationshipsActions'

export const metadata: Metadata = {
  title: 'My Relationships | Continua',
  description: 'Understand personality patterns in your relationships. See how Continua helps couples, families, and teams transform differences into complementarity.'
}

const sections = [
  {
    title: 'For Individuals',
    body: 'Continua helps you see your patterns across different situations and contexts. Maybe you\u2019re more conscientious at work than at home, more empathetic with friends than with co-workers. Understanding these shifts gives you real insight into how you operate in the world. You\u2019ll identify growth opportunities that matter to you, make better decisions about which environments bring out your best self, and build genuine self-awareness that goes beyond simple personality labels.',
  },
  {
    title: 'For Couples',
    body: 'Relationship friction often comes from misunderstood personality differences. When you can see exactly where your personalities align and diverge, those differences stop feeling like incompatibility and start looking like complementarity. Continua shows you how your partner\u2019s \u201Copposite\u201D traits might actually balance and strengthen your relationship. You\u2019ll understand why you react differently to the same situations, communicate more effectively, and access practical tools designed specifically for your unique combination.',
  },
  {
    title: 'For Families',
    body: 'Every family member brings a different personality profile to the table, and that complexity can create both richness and friction. Continua helps you map the whole ecosystem \u2014 see why siblings clash, understand parent-child dynamics, and recognize how everyone\u2019s wiring affects the family system. As children grow and circumstances change, you can track how these dynamics shift and adapt accordingly. The goal is helping everyone feel understood rather than judged.',
  },
  {
    title: 'For Teams',
    body: 'The best teams aren\u2019t made up of similar people \u2014 they\u2019re balanced across personality dimensions. Continua helps you assess whether your team has the range needed for a specific project, assign roles that match people\u2019s natural strengths, and identify gaps before they become problems. Whether you\u2019re building a new team or optimizing an existing one, you\u2019ll get insights into why certain combinations work and where personality differences might create friction worth planning around.',
  },
]

export default function MyRelationshipsPage() {
  return (
    <div>
      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-4">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-6">
            My Relationships
          </h1>
        </FadeIn>
        <FadeIn delay={100}>
          <MyRelationshipsActions />
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
              <Link href="/my-info" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors">
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
