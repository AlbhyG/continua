import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'Continua (v1)',
  description: 'Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.'
}

const dimensions = [
  { name: 'Empathy', range: 'Compassionate ↔ Self-Oriented' },
  { name: 'Self-Orientation', range: 'Altruistic ↔ Narcissistic' },
  { name: 'Social Attunement', range: 'Hyper-Aware ↔ Socially Blind' },
  { name: 'Conscientiousness', range: 'Planning ↔ Impulsive' },
  { name: 'Agency', range: 'Dominant ↔ Submissive' },
  { name: 'Reactivity', range: 'Emotionally Reactive ↔ Calm' },
]

export default function V1Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-16">
        <FadeIn>
          <h1 className="text-[44px] md:text-[60px] lg:text-[72px] leading-[1.08] font-bold text-white mb-4">
            Continua
          </h1>
          <h2 className="text-[22px] md:text-[28px] lg:text-[32px] leading-[1.3] font-light text-white/90 mb-10">
            a new language for understanding each other
          </h2>
        </FadeIn>
        <FadeIn delay={150}>
          <p className="text-[19px] md:text-[22px] leading-[1.6] italic text-white/80 max-w-[640px]">
            How can we improve the human condition one person, one couple, one family, and one office at a time?
          </p>
        </FadeIn>
      </section>

      {/* Feature Cards */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { href: '/v1/my-info', title: 'Know Yourself', desc: 'Take contextual assessments that capture your personality in motion — not a fixed label.' },
            { href: '/v1/my-relationships', title: 'Understand Others', desc: 'See how personality differences create complementarity in couples, families, and teams.' },
            { href: '/v1/graphic-exemplar', title: 'See the Patterns', desc: 'Visualize personality as color orbs across six dimensions — a living portrait in motion.' },
          ].map((card, i) => (
            <FadeIn key={card.href} delay={i * 100}>
              <Link
                href={card.href}
                className="glass-card-interactive block p-6 group h-full"
              >
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                  {card.title}
                </h3>
                <p className="text-foreground/65 text-[15px] leading-relaxed">
                  {card.desc}
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Philosophy — plain text on gradient, no card */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12">
        <FadeIn>
          <div className="text-[17px] md:text-[19px] leading-[1.7] text-white/90 space-y-5">
              <p>
                This is not a goal with an end state but, rather, the beginning of a process. All personality characteristics function on continua. Most people fall somewhere between the extremes, and even those positions shift depending on context, stress, growth, and intention.
              </p>
              <p>
                The purpose of this exploration is not to define personality in a way that makes more effective business teams or helps people find their perfect mate. The purpose is to give people tools to better relate to their family, friends, and colleagues. To transform conflicts that feel like character incompatibility into recognition of complementary positioning. To replace judgment with curiosity. To move from &ldquo;why can&rsquo;t you be different?&rdquo; to &ldquo;how can we leverage our differences?&rdquo;
              </p>
              <p>
                We introduce that vision: a way of seeing personality as fluid coordinates across six primary axes &mdash; Empathy, Self-Orientation, Social Attunement, Conscientiousness, Agency, and Reactivity. Together, these six dimensions form a living system &mdash; a portrait of human nature in motion.
              </p>
          </div>
        </FadeIn>
      </section>

      {/* Six Dimensions */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-16">
        <FadeIn>
          <h2 className="text-[26px] md:text-[32px] font-bold text-white mb-6 text-center">
            Six Dimensions of Personality
          </h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {dimensions.map((dim, i) => (
            <FadeIn key={dim.name} delay={i * 60}>
              <div className="glass-card p-4 text-center h-full">
                <h3 className="font-bold text-[15px] text-foreground mb-1">{dim.name}</h3>
                <p className="text-foreground/55 text-[13px]">{dim.range}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Privacy Policy — small link, bottom left, home page only */}
      <div className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-8">
        <Link
          href="/v1/privacy"
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}
