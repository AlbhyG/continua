// Structured interpretation (Layer 5) — the versioned object produced from six
// scores *before* any prose is written. See requirements §2.2.2 and issue #30.

export type AxisKey =
  | 'social_attunement'
  | 'empathy'
  | 'self_orientation'
  | 'conscientiousness'
  | 'agency'
  | 'reactivity'

export type Pole = 'high' | 'low'
export type Corner = 'high_high' | 'high_low' | 'low_high' | 'low_low'

/** Six integer scores, 1–10, rounded once when the result is saved. */
export type EngineScores = Record<AxisKey, number>

export interface AuthoredEntry {
  name: string
  text: string
}

export interface InterpretationReference {
  source: { layer2: string; layer3: string }
  axes: { key: AxisKey; title: string; high: string; low: string }[]
  /** Keyed "axisA|axisB" in fixed axis order; corners are `${poleA}_${poleB}`. */
  pairs: Record<string, { axes: [AxisKey, AxisKey]; anchors: Record<Corner, AuthoredEntry> }>
  single: Record<AxisKey, Record<Pole, AuthoredEntry>>
  modifierDefaults: Record<AxisKey, { summary: string; hypothesis: string }>
}

export interface AxisPosition {
  axis: AxisKey
  /** Integer score 1–10. */
  score: number
  /** Distance from center 5.5: one of 0.5, 1.5, 2.5, 3.5, 4.5. */
  extremity: number
  /** Direction scaled to [-1, 1]: (score − 5.5) / 4.5. Negative is the low end. */
  signed: number
  pole: Pole
  /** Integer score 5 or 6 (extremity 0.5). */
  balanced: boolean
}

export interface AnchorWeight {
  corner: Corner
  name: string
  /** Bilinear interpolation weight; the four weights of a pair sum to 1. */
  weight: number
}

export interface PairReading {
  key: string
  axes: [AxisKey, AxisKey]
  signed: [number, number]
  /** Sorted by weight, highest first. Interpolate between them; never snap to one. */
  anchors: AnchorWeight[]
}

export interface SingleAxisReading {
  axis: AxisKey
  pole: Pole
  signed: number
  name: string
}

export type PrimaryType = 'pair' | 'co_primary_pairs' | 'single_axis'

export type PrimaryRule =
  | 'tied_top_pairs' // 2–3 axes tied for most extreme: every pair within them
  | 'tied_top_reduced' // 4+ tied: first three by fixed axis order, then every pair
  | 'top_with_runner_up' // one top axis paired with each runner-up axis (1–3)
  | 'single_axis' // one top axis; runner-ups balanced or 4+ tied

export interface ModifierReading {
  axis: AxisKey
  /** 1 = most extreme modifier. */
  rank: number
  signed: number
  extremity: number
  pole: Pole
  balanced: boolean
  defaultSummary: string
}

export interface StructuredInterpretation {
  protocolVersion: string
  referenceVersion: { layer2: string; layer3: string }
  /** Deterministic cache key: protocol + reference versions + the six integer scores. */
  cacheKey: string
  positions: AxisPosition[]
  primary: {
    type: PrimaryType
    rule: PrimaryRule
    axes: AxisKey[]
    pairs: PairReading[]
    single: SingleAxisReading | null
  }
  modifiers: ModifierReading[]
  /** Conditions worth a human look; currently only 'all_balanced'. */
  flags: string[]
}
