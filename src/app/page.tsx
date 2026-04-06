import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'Continua: How Opposites Align',
  description: 'Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.'
}

const feelingAxes = [
  { name: 'Empathy', range: 'Empathy \u2194 Detachment' },
  { name: 'Self-Orientation', range: 'Altruism \u2194 Narcissism' },
  { name: 'Social Attunement', range: 'Hyper \u2194 Hypo' },
]

const behavioralAxes = [
  { name: 'Conscientiousness', range: 'Conscientiousness \u2194 Impulsivity' },
  { name: 'Agency', range: 'Assertive \u2194 Yielding' },
  { name: 'Reactivity', range: 'High \u2194 Low' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-16">
        <FadeIn>
          <h1 className="text-[44px] md:text-[60px] lg:text-[72px] leading-[1.08] font-bold text-white mb-4">
            Continua
          </h1>
          <h2 className="text-[22px] md:text-[28px] lg:text-[32px] leading-[1.3] font-light text-white/90 mb-10">
            How Opposites Align
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
            { href: '/my-info', title: 'Know Yourself', desc: 'Take contextual assessments that capture your personality in motion \u2014 not a fixed label.' },
            { href: '/my-relationships', title: 'Understand Others', desc: 'See how personality differences create complementarity in couples, families, and teams.' },
            { href: '/graphic-exemplar', title: 'See the Patterns', desc: 'Visualize personality as radar charts and color orbs across six dimensions \u2014 a living portrait in motion.' },
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
                The primary purpose of this exploration is to give people tools to better relate to their family, friends, and colleagues &mdash; and yes, to build stronger, more balanced teams at work. To transform conflicts that feel like character incompatibility into recognition of complementary positioning. To replace judgment with curiosity. To move from &ldquo;why can&rsquo;t you be different?&rdquo; to &ldquo;how can we leverage our differences?&rdquo;
              </p>
              <p>
                We introduce that vision: a way of seeing personality as fluid coordinates across six primary axes &mdash; Empathy, Self-Orientation, Social Attunement, Conscientiousness, Agency, and Reactivity. Together, these six dimensions form a living system &mdash; a portrait of human nature in motion.
              </p>
              <p>
                Behind all six axes lies a deeper capacity: meta-awareness &mdash; the ability to observe your own personality patterns as they unfold. This metacognition is the real instrument for conducting your inner orchestra, the tool that lets you notice where you are on each continuum and choose, with intention, where you want to move.
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

        <div className="space-y-6">
          <div>
            <FadeIn>
              <h3 className="text-[16px] md:text-[18px] font-semibold text-white/70 mb-3 text-center tracking-wide uppercase">
                How We Feel
              </h3>
            </FadeIn>
            <div className="grid grid-cols-3 gap-3">
              {feelingAxes.map((dim, i) => (
                <FadeIn key={dim.name} delay={i * 60}>
                  <div className="glass-card p-4 text-center h-full">
                    <h4 className="font-bold text-[15px] text-foreground mb-1">{dim.name}</h4>
                    <p className="text-foreground/55 text-[13px]">{dim.range}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <div>
            <FadeIn>
              <h3 className="text-[16px] md:text-[18px] font-semibold text-white/70 mb-3 text-center tracking-wide uppercase">
                How We Act
              </h3>
            </FadeIn>
            <div className="grid grid-cols-3 gap-3">
              {behavioralAxes.map((dim, i) => (
                <FadeIn key={dim.name} delay={i * 60 + 180}>
                  <div className="glass-card p-4 text-center h-full">
                    <h4 className="font-bold text-[15px] text-foreground mb-1">{dim.name}</h4>
                    <p className="text-foreground/55 text-[13px]">{dim.range}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy — small link, bottom left, home page only */}
      <div className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-8">
        <Link
          href="/privacy"
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}
