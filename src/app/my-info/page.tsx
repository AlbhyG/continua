import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'My Info | Continua',
  description: 'Understand your personality patterns across different contexts. Take assessments, see results, and get personalized insights with Continua.'
}

export default function MyInfoPage() {
  return (
    <div>
      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white">
            My Info
          </h1>
        </FadeIn>
      </section>

      {/* Content cards */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12 space-y-6">
        <FadeIn>
          <div className="glass-card p-8">
            <h2 className="text-[22px] md:text-[26px] font-bold mb-4">Take Assessments</h2>
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85">
              Your personality isn&rsquo;t static &mdash; it shifts based on context, relationships, and circumstances. That&rsquo;s why Continua offers hundreds of different assessment variations you can take whenever you want. Maybe you take one at work on a stressful Monday, another at home on a relaxed Sunday evening, and a third while traveling. Each snapshot captures where you are in that moment, and over time, these assessments build a rich picture of your personality patterns. You can tag each one with what you were doing, where you were, and who you were with, so you can start to see the contexts that bring out different aspects of yourself.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="glass-card p-8">
            <h2 className="text-[22px] md:text-[26px] font-bold mb-4">See Your Results</h2>
            <div className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85 space-y-5">
              <p>
                This is where it gets interesting. All your assessments are collected in one place, and you can view them in whatever way makes sense for what you&rsquo;re exploring. Want to see how your personality shifts over time? Sort by date. Curious whether you&rsquo;re different at home versus at the office? Filter by location. Wondering if certain activities bring out specific traits? Group by what you were doing.
              </p>
              <p>
                You can also organize results by cohort &mdash; look at yourself individually, compare your profile with your partner&rsquo;s, see how your family members&rsquo; personalities interact, or understand your team&rsquo;s collective strengths and gaps. The visual displays show not just your individual profile, but how groups add up. Does your team cover all the personality bases needed for your project? Are you and your partner complementary across the key dimensions?
              </p>
              <p>
                Within each dimension, you can input specific goals and get personalized suggestions for how to optimize your approach. The system helps you understand not just where you are, but how to leverage that knowledge for the growth and outcomes you&rsquo;re after.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="glass-card p-8">
            <h2 className="text-[22px] md:text-[26px] font-bold mb-4">Tools and Actions</h2>
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/85">
              Understanding your personality is just the starting point &mdash; the real value comes from knowing what to do with that information. Within each dimension, you can set specific goals and get personalized recommendations tailored to your unique profile. Whether you&rsquo;re working on individual growth, strengthening a relationship, improving family dynamics, or optimizing team performance, Continua provides actionable strategies based on where you actually are, not where some generic type says you should be. The tools adapt to your specific patterns and contexts, giving you practical next steps that make sense for your situation.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="glass-card p-6">
            <p className="text-[17px] md:text-[19px] leading-[1.7] text-foreground/75 italic">
              Check out{' '}
              <Link href="/my-relationships" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors">
                My Relationships
              </Link>{' '}
              to see how Continua works for couples, families, and teams.
            </p>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
