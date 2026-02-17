import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Info | Continua',
  description: 'Understand your personality patterns across different contexts. Take assessments, see results, and get personalized insights with Continua.'
}

export default function MyInfoPage() {
  return (
    <main className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold mb-8">My Info</h1>
      <section className="space-y-8">
        <div>
          <h2 className="text-[24px] md:text-[28px] font-bold mb-3">Take Assessments</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Your personality isn't static — it shifts based on context, relationships, and circumstances. That's why Continua offers hundreds of different assessment variations you can take whenever you want. Maybe you take one at work on a stressful Monday, another at home on a relaxed Sunday evening, and a third while traveling. Each snapshot captures where you are in that moment, and over time, these assessments build a rich picture of your personality patterns. You can tag each one with what you were doing, where you were, and who you were with, so you can start to see the contexts that bring out different aspects of yourself.
          </p>
        </div>
        <div>
          <h2 className="text-[24px] md:text-[28px] font-bold mb-3">See Your Results</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            This is where it gets interesting. All your assessments are collected in one place, and you can view them in whatever way makes sense for what you're exploring. Want to see how your personality shifts over time? Sort by date. Curious whether you're different at home versus at the office? Filter by location. Wondering if certain activities bring out specific traits? Group by what you were doing.
          </p>
          <p className="text-[18px] md:text-[20px] leading-[1.6] mt-4">
            You can also organize results by cohort — look at yourself individually, compare your profile with your partner's, see how your family members' personalities interact, or understand your team's collective strengths and gaps. The visual displays show not just your individual profile, but how groups add up. Does your team cover all the personality bases needed for your project? Are you and your partner complementary across the key dimensions?
          </p>
          <p className="text-[18px] md:text-[20px] leading-[1.6] mt-4">
            Within each dimension, you can input specific goals and get personalized suggestions for how to optimize your approach. The system helps you understand not just where you are, but how to leverage that knowledge for the growth and outcomes you're after.
          </p>
        </div>
        <div>
          <h2 className="text-[24px] md:text-[28px] font-bold mb-3">Tools and Actions</h2>
          <p className="text-[18px] md:text-[20px] leading-[1.6]">
            Understanding your personality is just the starting point — the real value comes from knowing what to do with that information. Within each dimension, you can set specific goals and get personalized recommendations tailored to your unique profile. Whether you're working on individual growth, strengthening a relationship, improving family dynamics, or optimizing team performance, Continua provides actionable strategies based on where you actually are, not where some generic type says you should be. The tools adapt to your specific patterns and contexts, giving you practical next steps that make sense for your situation.
          </p>
        </div>
      </section>
      <p className="text-[18px] md:text-[20px] leading-[1.6] mt-8 italic">
        Check out <Link href="/my-relationships" className="underline hover:text-accent transition-colors">My Relationships</Link> to see how Continua works for couples, families, and teams.
      </p>
    </main>
  );
}
