'use client'

import { useState } from 'react'
import PersonalityOrb, { type OrbData } from '@/components/PersonalityOrb'

interface SliderValues {
  empathy: number
  altruism: number
  attunement: number
  conscientiousness: number
  dominance: number
  reactivity: number
}

function toOrbData(s: SliderValues): OrbData {
  return {
    yellow: s.empathy,
    navy: 10 - s.empathy,
    chartreuse: s.altruism,
    indigo: 10 - s.altruism,
    lime: s.attunement,
    violet: 10 - s.attunement,
    emerald: s.conscientiousness,
    magenta: 10 - s.conscientiousness,
    red: s.dominance,
    teal: 10 - s.dominance,
    orange: s.reactivity,
    blue: 10 - s.reactivity,
  }
}

const PRESETS: Record<string, SliderValues> = {
  'Mother Teresa': {
    empathy: 10,
    altruism: 9,
    attunement: 8,
    conscientiousness: 9,
    dominance: 2,
    reactivity: 3,
  },
  'Hitler': {
    empathy: 1,
    altruism: 1,
    attunement: 1,
    conscientiousness: 3,
    dominance: 9,
    reactivity: 7,
  },
  'Balanced': {
    empathy: 5,
    altruism: 5,
    attunement: 5,
    conscientiousness: 5,
    dominance: 5,
    reactivity: 5,
  },
}

const AXES = [
  {
    key: 'empathy' as const,
    lowLabel: 'Low Empathy / Callousness',
    highLabel: 'High Empathy / Compassion',
    lowColor: '#41377B',
    highColor: '#FCF050',
  },
  {
    key: 'altruism' as const,
    lowLabel: 'Self-Focused / Narcissistic',
    highLabel: 'Altruistic / Self-Transcendent',
    lowColor: '#68397C',
    highColor: '#ABC854',
  },
  {
    key: 'attunement' as const,
    lowLabel: 'Hypo-Socially Attuned',
    highLabel: 'Hyper-Socially Attuned',
    lowColor: '#933160',
    highColor: '#4BA454',
  },
  {
    key: 'conscientiousness' as const,
    lowLabel: 'Impulsive / Disinhibited',
    highLabel: 'Conscientious / Planning',
    lowColor: '#DA1070',
    highColor: '#49A297',
  },
  {
    key: 'dominance' as const,
    lowLabel: 'Submissive / Yielding',
    highLabel: 'Dominant / Agentic',
    lowColor: '#4BA6D2',
    highColor: '#C13732',
  },
  {
    key: 'reactivity' as const,
    lowLabel: 'Low Reactivity / Flat Affect',
    highLabel: 'High Reactivity',
    lowColor: '#2B65A0',
    highColor: '#D16539',
  },
]

export default function OrbDemoPage() {
  const [sliders, setSliders] = useState<SliderValues>(PRESETS['Mother Teresa'])
  const [activePreset, setActivePreset] = useState('Mother Teresa')

  const updateSlider = (key: keyof SliderValues, value: number) => {
    setSliders(prev => ({ ...prev, [key]: value }))
    setActivePreset('')
  }

  const loadPreset = (name: string) => {
    setSliders(PRESETS[name])
    setActivePreset(name)
  }

  const orbData = toOrbData(sliders)

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-[960px] mx-auto px-6 pt-24 pb-8">
        <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-gray-900 mb-2">
          Personality Orb Generator
        </h1>
        <p className="text-[17px] text-gray-500">
          Deterministic WebGL shader &mdash; same data always produces the same orb.
        </p>
      </section>

      <section className="max-w-[960px] mx-auto px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Orb display */}
          <div className="flex flex-col items-center gap-5 shrink-0">
            <PersonalityOrb data={orbData} size={350} />

            {/* Presets */}
            <div className="flex gap-3">
              {Object.keys(PRESETS).map(name => (
                <button
                  key={name}
                  onClick={() => loadPreset(name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePreset === name
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="flex-1 flex flex-col gap-5">
            {AXES.map(axis => (
              <div key={axis.key}>
                <div className="flex justify-between items-baseline text-sm mb-1.5">
                  <span className="font-medium" style={{ color: axis.lowColor }}>
                    {axis.lowLabel}
                  </span>
                  <span className="text-gray-400 font-mono text-xs mx-2">
                    {sliders[axis.key]}
                  </span>
                  <span className="font-medium text-right" style={{ color: axis.highColor }}>
                    {axis.highLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={sliders[axis.key]}
                  onChange={e => updateSlider(axis.key, Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${axis.lowColor}, ${axis.highColor})`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Side by side comparison */}
      <section className="max-w-[960px] mx-auto px-6 pb-16">
        <h2 className="text-[24px] md:text-[32px] leading-[1.2] font-bold text-gray-900 mb-6">
          Side-by-Side Comparison
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          {Object.entries(PRESETS).map(([name, presetSliders]) => (
            <div key={name} className="text-center">
              <PersonalityOrb data={toOrbData(presetSliders)} size={220} />
              <p className="text-lg font-semibold text-gray-900 mt-2">{name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
