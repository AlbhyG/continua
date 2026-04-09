import type { Metadata } from 'next'
import Image from 'next/image'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'Graphic Exemplar (v2)',
  description:
    'Personality Color Orbs \u2014 visual representations of the Continua Six-Axis personality profile.',
}

export default function V2GraphicExemplarPage() {
  return (
    <div>
      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-4">
            Personality Color Orbs
          </h1>
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/80">
            We generate color orbs and radar charts (spider diagrams) based on your Continua Six-Axis profile at any
            moment. The radar chart plots your coordinates across all six axes to create a unique psychological fingerprint, while
            color orbs use colors to represent the different axes:
          </p>
        </FadeIn>
      </section>

      {/* Axes Diagram */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12">
        <FadeIn>
          <div className="glass-card p-6 md:p-8">
            <div className="flex justify-center">
              <Image
                src="/axes-diagram.png"
                alt="Continua Six-Axis personality diagram showing the twelve poles: High Empathy, Altruism/Self-Transcendent, Hyper-Socially Attuned, High Conscientiousness, Assertive/Agentic, High Reactivity, and their opposites"
                width={500}
                height={500}
                className="rounded-lg"
              />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Extreme Examples */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12">
        <FadeIn>
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-[24px] md:text-[32px] leading-[1.2] font-bold mb-6">
              Extreme Examples
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-[18px] font-bold mb-1">High Empathy</h3>
                <p className="text-[15px] text-foreground/60 italic">e.g., Mother Teresa</p>
              </div>
              <div>
                <h3 className="text-[18px] font-bold mb-1">Narcissism</h3>
                <p className="text-[15px] text-foreground/60 italic">e.g., Hitler</p>
              </div>
            </div>

            {/* Personality Orbs */}
            <div className="flex justify-center">
              <Image
                src="/personality-orbs.png"
                alt="Two personality color orbs \u2014 High Empathy profile (blue, teal, yellow) and Detachment profile (purple, magenta, red-orange)"
                width={600}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Graphic Map */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-16">
        <FadeIn>
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-[24px] md:text-[32px] leading-[1.2] font-bold mb-6">
              Graphic Map with Values
            </h2>
            <div className="flex justify-center">
              <Image
                src="/graphic-map.png"
                alt="Detailed graphic map showing Mother Teresa and Hitler personality profiles as color wheels with axis values"
                width={700}
                height={350}
                className="rounded-lg"
              />
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
