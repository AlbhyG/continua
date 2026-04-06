import type { Metadata } from 'next'
import Image from 'next/image'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'Graphic Exemplar | Continua (v1)',
  description:
    'Personality Color Orbs — visual representations of the Continua Six-Axis personality profile.',
}

export default function V1GraphicExemplarPage() {
  return (
    <div>
      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-4">
            Personality Color Orbs
          </h1>
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/80">
            We generate color orbs based on your Continua Six-Axis profile at any
            moment using colors to represent the different axes:
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
                alt="Continua Six-Axis personality diagram showing the twelve poles: High Empathy/Compassion, Altruistic/Self-Transcendent, Hyper-Socially Attuned, High Conscientiousness/Planning, Dominant/Agentic, High Reactivity, and their opposites"
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
                <h3 className="text-[18px] font-bold mb-1">High Compassion</h3>
                <p className="text-[15px] text-foreground/60 italic">e.g., Mother Teresa</p>
              </div>
              <div>
                <h3 className="text-[18px] font-bold mb-1">Low Compassion</h3>
                <p className="text-[15px] text-foreground/60 italic">e.g., Hitler</p>
              </div>
            </div>

            {/* Personality Orbs */}
            <div className="flex justify-center">
              <Image
                src="/personality-orbs.png"
                alt="Two personality color orbs — High Compassion profile (blue, teal, yellow) and Low Compassion profile (purple, magenta, red-orange)"
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
