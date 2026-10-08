// Layer 4 composition protocol: six integer scores → structured interpretation.
// Deterministic by construction: no randomness, no clock, no I/O, and every tie
// is broken by the fixed axis order. Rules: requirements §2.2.2, decided in
// issue #30 (October 4, 2026).

import { REFERENCE } from './reference'
import type {
  AnchorWeight,
  AxisKey,
  AxisPosition,
  Corner,
  EngineScores,
  InterpretationReference,
  ModifierReading,
  PairReading,
  PrimaryRule,
  StructuredInterpretation,
} from './types'

/** Bump when any rule below changes: it invalidates cached interpretations. */
export const PROTOCOL_VERSION = 'layer4-2026-10-06'

/** Fixed axis order: Attunement → Empathy → Orientation → Conscientiousness → Agency → Reactivity. */
export const AXIS_ORDER: readonly AxisKey[] = [
  'social_attunement',
  'empathy',
  'self_orientation',
  'conscientiousness',
  'agency',
  'reactivity',
]

const CENTER = 5.5
const HALF_RANGE = 4.5
const BALANCED_EXTREMITY = 0.5
const MAX_CO_PRIMARY_AXES = 3

const rank = (axis: AxisKey) => AXIS_ORDER.indexOf(axis)

/**
 * Round displayed scores (1–10, one decimal) to the engine's integer scale.
 * Call once, when a result is saved, and store the result alongside the
 * displayed score. Halves round up (5.5 → 6), matching Math.round.
 */
export function toEngineScores(scores: Record<AxisKey, number>): EngineScores {
  const out = {} as EngineScores
  for (const axis of AXIS_ORDER) {
    const value = scores[axis]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 1 || value > 10) {
      throw new RangeError(`Score for ${axis} must be a number from 1 to 10`)
    }
    out[axis] = Math.round(value)
  }
  return out
}

function assertEngineScores(scores: EngineScores) {
  for (const axis of AXIS_ORDER) {
    const value = scores[axis]
    if (!Number.isInteger(value) || value < 1 || value > 10) {
      throw new RangeError(`Engine score for ${axis} must be an integer from 1 to 10 (use toEngineScores at save time)`)
    }
  }
}

function position(axis: AxisKey, score: number): AxisPosition {
  const extremity = Math.abs(score - CENTER)
  return {
    axis,
    score,
    extremity,
    signed: (score - CENTER) / HALF_RANGE,
    pole: score > CENTER ? 'high' : 'low',
    balanced: extremity === BALANCED_EXTREMITY,
  }
}

/** Most extreme first; equal extremity ordered by the fixed axis order. */
function byExtremity(a: AxisPosition, b: AxisPosition) {
  return b.extremity - a.extremity || rank(a.axis) - rank(b.axis)
}

function pairReading(a: AxisPosition, b: AxisPosition, ref: InterpretationReference): PairReading {
  const [first, second] = rank(a.axis) < rank(b.axis) ? [a, b] : [b, a]
  const key = `${first.axis}|${second.axis}`
  const entry = ref.pairs[key]
  if (!entry) throw new Error(`Reference is missing pair ${key}`)
  // Bilinear interpolation across the four corners of the pair's 2-D space.
  const share = (signed: number, pole: 'high' | 'low') => (pole === 'high' ? 1 + signed : 1 - signed) / 2
  const anchors: AnchorWeight[] = (['high_high', 'high_low', 'low_high', 'low_low'] as Corner[])
    .map((corner) => {
      const [p1, p2] = corner.split('_') as ['high' | 'low', 'high' | 'low']
      return { corner, name: entry.anchors[corner].name, weight: round4(share(first.signed, p1) * share(second.signed, p2)) }
    })
    .sort((x, y) => y.weight - x.weight || x.corner.localeCompare(y.corner))
  return { key, axes: [first.axis, second.axis], signed: [round4(first.signed), round4(second.signed)], anchors }
}

function allPairs(axes: AxisPosition[]): [AxisPosition, AxisPosition][] {
  const out: [AxisPosition, AxisPosition][] = []
  for (let i = 0; i < axes.length; i++) for (let j = i + 1; j < axes.length; j++) out.push([axes[i], axes[j]])
  return out
}

const round4 = (n: number) => Math.round(n * 10000) / 10000

export function interpret(scores: EngineScores, ref: InterpretationReference = REFERENCE): StructuredInterpretation {
  assertEngineScores(scores)
  const positions = AXIS_ORDER.map((axis) => position(axis, scores[axis]))
  const ranked = [...positions].sort(byExtremity)

  const top = ranked.filter((p) => p.extremity === ranked[0].extremity)
  let rule: PrimaryRule
  let primaryAxes: AxisPosition[]
  let pairs: [AxisPosition, AxisPosition][] = []
  let single: AxisPosition | null = null

  if (ranked[0].balanced) {
    // Every axis is in the balanced band: no primary; all six are modifiers.
    rule = 'balanced'
    primaryAxes = []
  } else if (top.length >= 2) {
    // Ties for most extreme are kept as co-primary; 4+ fall back to axis order.
    rule = top.length > MAX_CO_PRIMARY_AXES ? 'tied_top_reduced' : 'tied_top_pairs'
    primaryAxes = [...top].sort((a, b) => rank(a.axis) - rank(b.axis)).slice(0, MAX_CO_PRIMARY_AXES)
    pairs = allPairs(primaryAxes)
  } else {
    const rest = ranked.slice(1)
    const runnerUp = rest.filter((p) => p.extremity === rest[0].extremity)
    if (runnerUp[0].balanced || runnerUp.length > MAX_CO_PRIMARY_AXES) {
      rule = 'single_axis'
      primaryAxes = [top[0]]
      single = top[0]
    } else {
      rule = 'top_with_runner_up'
      primaryAxes = [top[0], ...runnerUp]
      pairs = runnerUp.map((p) => [top[0], p] as [AxisPosition, AxisPosition])
    }
  }

  const primarySet = new Set(primaryAxes.map((p) => p.axis))
  const modifiers: ModifierReading[] = ranked
    .filter((p) => !primarySet.has(p.axis))
    .map((p, i) => ({
      axis: p.axis,
      rank: i + 1,
      signed: round4(p.signed),
      extremity: p.extremity,
      pole: p.pole,
      balanced: p.balanced,
      defaultSummary: ref.modifierDefaults[p.axis].summary,
    }))

  return {
    protocolVersion: PROTOCOL_VERSION,
    referenceVersion: { ...ref.source },
    cacheKey: [PROTOCOL_VERSION, ref.source.layer2, ref.source.layer3, ...AXIS_ORDER.map((a) => scores[a])].join(':'),
    positions,
    primary: {
      type: rule === 'balanced' ? 'balanced' : single ? 'single_axis' : pairs.length === 1 ? 'pair' : 'co_primary_pairs',
      rule,
      axes: [...primaryAxes].sort((a, b) => rank(a.axis) - rank(b.axis)).map((p) => p.axis),
      pairs: pairs.map(([a, b]) => pairReading(a, b, ref)),
      single: single
        ? { axis: single.axis, pole: single.pole, signed: round4(single.signed), name: ref.single[single.axis][single.pole].name }
        : null,
      balanced: rule === 'balanced' ? { name: ref.balanced.name } : null,
    },
    modifiers,
  }
}
