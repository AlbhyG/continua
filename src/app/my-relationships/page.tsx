import type { Metadata } from 'next'
import Link from 'next/link'
import MyRelationshipsActions from '@/components/MyRelationshipsActions'

export const metadata: Metadata = {
  title: 'My Relationships | Continua',
  description: 'Understand personality patterns in your relationships. See how Continua helps couples, families, and teams transform differences into complementarity.'
}

export default function MyRelationshipsPage() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-6">My Relationships</h1>
      <MyRelationshipsActions />
      <section className="space-y-8">
        <div>
          <h2 className="text-[24px] font-bold mb-3">For Individuals</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Continua helps you see your patterns across different situations and contexts. Maybe you're more conscientious at work than at home, more empathetic with friends than with co-workers. Understanding these shifts gives you real insight into how you operate in the world. You'll identify growth opportunities that matter to you, make better decisions about which environments bring out your best self, and build genuine self-awareness that goes beyond simple personality labels.
          </p>
        </div>
        <div>
          <h2 className="text-[24px] font-bold mb-3">For Couples</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Relationship friction often comes from misunderstood personality differences. When you can see exactly where your personalities align and diverge, those differences stop feeling like incompatibility and start looking like complementarity. Continua shows you how your partner's "opposite" traits might actually balance and strengthen your relationship. You'll understand why you react differently to the same situations, communicate more effectively, and access practical tools designed specifically for your unique combination.
          </p>
        </div>
        <div>
          <h2 className="text-[24px] font-bold mb-3">For Families</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Every family member brings a different personality profile to the table, and that complexity can create both richness and friction. Continua helps you map the whole ecosystem — see why siblings clash, understand parent-child dynamics, and recognize how everyone's wiring affects the family system. As children grow and circumstances change, you can track how these dynamics shift and adapt accordingly. The goal is helping everyone feel understood rather than judged.
          </p>
        </div>
        <div>
          <h2 className="text-[24px] font-bold mb-3">For Teams</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            The best teams aren't made up of similar people — they're balanced across personality dimensions. Continua helps you assess whether your team has the range needed for a specific project, assign roles that match people's natural strengths, and identify gaps before they become problems. Whether you're building a new team or optimizing an existing one, you'll get insights into why certain combinations work and where personality differences might create friction worth planning around.
          </p>
        </div>
      </section>
      <p className="text-[18px] md:text-[20px] leading-[1.6] mt-8 italic">
        Want to learn more about yourself? Check out <Link href="/my-info" className="underline hover:text-accent transition-colors">My Info</Link> to explore personality assessments and your personal profile.
      </p>
    </main>
  );
}
