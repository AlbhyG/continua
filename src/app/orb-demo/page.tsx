'use client'

import { useState } from 'react'
import Link from 'next/link'
import PersonalityOrb from '@/components/PersonalityOrb'
import RadarProfile from '@/components/quiz/RadarProfile'
import { scoresToOrbData } from '@/lib/quiz/orb-mapping'
import type { AxisScores } from '@/lib/quiz/scoring'
import profiles from '../../../data/famous-figures-profiles.json'

type Scores = Pick<
  AxisScores,
  'social_attunement' | 'empathy' | 'self_orientation' | 'conscientiousness' | 'agency' | 'reactivity'
>

// Same end-of-axis words as the About page diagram (AxesDiagram).
const AXES: Array<{
  key: keyof Scores
  name: string
  lowLabel: string
  highLabel: string
  lowColor: string
  highColor: string
}> = [
  { key: 'social_attunement', name: 'Social Attunement', lowLabel: 'Socially Independent', highLabel: 'Socially Attuned', lowColor: '#41377B', highColor: '#C9B800' },
  { key: 'empathy',           name: 'Empathy',           lowLabel: 'Detached',             highLabel: 'Empathetic',       lowColor: '#68397C', highColor: '#7FA02E' },
  { key: 'self_orientation',  name: 'Self-Orientation',  lowLabel: 'Altruistic',           highLabel: 'Self-Focused',     lowColor: '#4BA454', highColor: '#933160' },
  { key: 'conscientiousness', name: 'Conscientiousness', lowLabel: 'Spontaneous',          highLabel: 'Conscientious',    lowColor: '#DA1070', highColor: '#3F8F85' },
  { key: 'agency',            name: 'Agency',            lowLabel: 'Accommodating',        highLabel: 'Agentic',          lowColor: '#3E94BF', highColor: '#C13732' },
  { key: 'reactivity',        name: 'Reactivity',        lowLabel: 'Low Reactivity',       highLabel: 'High Reactivity',  lowColor: '#2B65A0', highColor: '#D16539' },
]

// A spread of figures from different categories on the Famous Figures page.
const PRESET_NAMES = [
  'Florence Nightingale',
  'Isaac Newton',
  'Marcus Aurelius',
  'Lord Byron',
  'Vincent van Gogh',
  'Napoleon Bonaparte',
]

const PRESETS: Array<{ name: string; scores: Scores }> = PRESET_NAMES.flatMap((name) => {
  const p = (profiles as Array<{ name: string; scores: Scores }>).find((x) => x.name === name)
  return p ? [{ name, scores: p.scores }] : []
})

function toRadar(s: Scores) {
  return AXES.map((a) => ({
    axis: a.key,
    name: a.name,
    score: s[a.key],
    label: '',
    highLabel: a.highLabel,
    lowLabel: a.lowLabel,
  }))
}

export default function OrbDemoPage() {
  const [scores, setScores] = useState<Scores>(PRESETS[0].scores)
  const [active, setActive] = useState(PRESETS[0].name)

  const update = (key: keyof Scores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }))
    setActive('')
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-[960px] mx-auto px-6 pt-24 pb-8">
        <Link
          href="/famous-figures"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
          Famous Figures
        </Link>
        <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-gray-900 mb-3">
          How an Orb Works
        </h1>
        <p className="text-[17px] md:text-[18px] leading-[1.6] text-gray-600 max-w-[680px]">
          Move the sliders to see how each of the six dimensions shapes an orb, or
          start from one of the figures below.
        </p>
        <p className="mt-3 text-[15px] leading-[1.6] text-gray-500 italic max-w-[680px]">
          This is a way to see how the dimensions interact, not a measure of anyone.
          Your own orb comes from the Continua assessment, coming soon.
        </p>
      </section>

      <section className="max-w-[960px] mx-auto px-6 pb-16">
        <div className="grid gap-6 lg:gap-x-10 lg:gap-y-5 lg:grid-cols-[360px_1fr] lg:items-start">
          {/* Orb: pinned under the header on phones so it stays visible while sliding */}
          <div className="sticky top-[83px] lg:top-auto z-10 -mx-6 px-6 py-2 bg-white/95 backdrop-blur flex justify-center lg:static lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:col-start-1 lg:row-start-1">
            <div className="lg:hidden"><PersonalityOrb data={scoresToOrbData(scores)} size={190} /></div>
            <div className="hidden lg:block"><PersonalityOrb data={scoresToOrbData(scores)} size={300} /></div>
          </div>

          {/* Radar: below the sliders on phones, under the orb on desktop */}
          <div className="order-last lg:order-none lg:col-start-1 lg:row-start-2 w-full max-w-[360px] mx-auto">
            <RadarProfile data={toRadar(scores)} />
          </div>

          {/* Presets + sliders */}
          <div className="w-full flex flex-col gap-6 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Start from a figure
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setScores(p.scores)
                      setActive(p.name)
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      active === p.name
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {AXES.map((axis) => (
              <div key={axis.key}>
                <div className="flex justify-between items-baseline gap-2 text-sm mb-1.5">
                  <span className="font-semibold" style={{ color: axis.lowColor }}>
                    {axis.lowLabel}
                  </span>
                  <span className="font-semibold text-right" style={{ color: axis.highColor }}>
                    {axis.highLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={scores[axis.key]}
                  onChange={(e) => update(axis.key, Number(e.target.value))}
                  aria-label={`${axis.name}: ${axis.lowLabel} to ${axis.highLabel}`}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, ${axis.lowColor}, ${axis.highColor})` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
