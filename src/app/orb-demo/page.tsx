'use client'

import { useState } from 'react'
import PersonalityOrb, { type OrbData } from '@/components/PersonalityOrb'

const PRESETS: Record<string, OrbData> = {
  'Mother Teresa': {
    yellow: 10, blue: 1,
    chartreuse: 9, indigo: 1,
    lime: 8, violet: 2,
    emerald: 9, magenta: 1,
    teal: 2, red: 1,
    aqua: 3, orange: 2,
  },
  'Hitler': {
    yellow: 1, blue: 9,
    chartreuse: 1, indigo: 10,
    lime: 1, violet: 8,
    emerald: 3, magenta: 8,
    teal: 9, red: 8,
    aqua: 2, orange: 7,
  },
  'Balanced': {
    yellow: 5, blue: 5,
    chartreuse: 5, indigo: 5,
    lime: 5, violet: 5,
    emerald: 5, magenta: 5,
    teal: 5, red: 5,
    aqua: 5, orange: 5,
  },
}

const LABELS = [
  ['yellow', 'Yellow (Empathy)'],
  ['blue', 'Blue (Detachment)'],
  ['chartreuse', 'Chartreuse (Altruism)'],
  ['indigo', 'Indigo (Narcissism)'],
  ['lime', 'Lime (Hyper-Attuned)'],
  ['violet', 'Violet (Hypo-Attuned)'],
  ['emerald', 'Emerald (Conscientious)'],
  ['magenta', 'Magenta (Impulsive)'],
  ['teal', 'Teal (Assertive)'],
  ['red', 'Red (Yielding)'],
  ['aqua', 'Aqua (Low Reactivity)'],
  ['orange', 'Orange (High Reactivity)'],
] as const

const SLIDER_COLORS: Record<string, string> = {
  yellow: '#FFD700',
  blue: '#3366FF',
  chartreuse: '#7FFF00',
  indigo: '#4B0082',
  lime: '#32CD32',
  violet: '#8A2BE2',
  emerald: '#50C878',
  magenta: '#FF00FF',
  teal: '#008080',
  red: '#FF0000',
  aqua: '#00CED1',
  orange: '#FF8C00',
}

export default function OrbDemoPage() {
  const [data, setData] = useState<OrbData>(PRESETS['Mother Teresa'])
  const [activePreset, setActivePreset] = useState('Mother Teresa')

  const updateValue = (key: keyof OrbData, value: number) => {
    setData(prev => ({ ...prev, [key]: value }))
    setActivePreset('')
  }

  const loadPreset = (name: string) => {
    setData(PRESETS[name])
    setActivePreset(name)
  }

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
          <div className="flex flex-col items-center gap-5">
            <PersonalityOrb data={data} size={350} />

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
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {LABELS.map(([key, label]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium" style={{ color: SLIDER_COLORS[key] }}>{label}</span>
                  <span className="text-gray-400 font-mono">{data[key as keyof OrbData]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={data[key as keyof OrbData]}
                  onChange={e => updateValue(key as keyof OrbData, Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${SLIDER_COLORS[key]}30, ${SLIDER_COLORS[key]})`,
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
          {Object.entries(PRESETS).map(([name, presetData]) => (
            <div key={name} className="text-center">
              <PersonalityOrb data={presetData} size={220} />
              <p className="text-lg font-semibold text-gray-900 mt-2">{name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
