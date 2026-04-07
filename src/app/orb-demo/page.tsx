'use client'

import { useState } from 'react'
import PersonalityOrb, { type OrbData } from '@/components/PersonalityOrb'

const PRESETS: Record<string, OrbData> = {
  'Mother Teresa': {
    yellow: 10, blue: 1,       // Empathy: high
    chartreuse: 9, indigo: 1,   // Self-Orientation: altruistic
    lime: 8, violet: 2,         // Attunement: hyper
    emerald: 9, magenta: 1,     // Conscientiousness: high
    teal: 2, red: 1,            // Agency: yielding
    aqua: 3, orange: 2,         // Reactivity: low
  },
  'Hitler': {
    yellow: 1, blue: 9,         // Empathy: detached
    chartreuse: 1, indigo: 10,  // Self-Orientation: narcissistic
    lime: 1, violet: 8,         // Attunement: hypo
    emerald: 3, magenta: 8,     // Conscientiousness: impulsive
    teal: 9, red: 8,            // Agency: assertive
    aqua: 2, orange: 7,         // Reactivity: high
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-bold mb-2">Personality Orb Generator</h1>
        <p className="text-white/60 mb-8">Deterministic WebGL shader — same data always produces the same orb.</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Orb display */}
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white rounded-2xl p-8 inline-block">
              <PersonalityOrb data={data} size={350} />
            </div>

            {/* Presets */}
            <div className="flex gap-3">
              {Object.keys(PRESETS).map(name => (
                <button
                  key={name}
                  onClick={() => loadPreset(name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePreset === name
                      ? 'bg-white text-black'
                      : 'bg-white/10 hover:bg-white/20'
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
                  <span style={{ color: SLIDER_COLORS[key] }}>{label}</span>
                  <span className="text-white/60 font-mono">{data[key as keyof OrbData]}</span>
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
                    background: `linear-gradient(to right, ${SLIDER_COLORS[key]}40, ${SLIDER_COLORS[key]})`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Side by side comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Side-by-Side Comparison</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {Object.entries(PRESETS).map(([name, presetData]) => (
              <div key={name} className="text-center">
                <div className="bg-white rounded-xl p-4 inline-block mb-2">
                  <PersonalityOrb data={presetData} size={220} />
                </div>
                <p className="text-lg font-semibold">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
