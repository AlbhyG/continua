import { test } from 'node:test'
import assert from 'node:assert/strict'
import { interpret, toEngineScores, AXIS_ORDER, PROTOCOL_VERSION } from './compose'
import { REFERENCE } from './reference'
import type { EngineScores } from './types'

// Order: social_attunement, empathy, self_orientation, conscientiousness, agency, reactivity
const s = (sa: number, em: number, so: number, co: number, ag: number, re: number): EngineScores => ({
  social_attunement: sa, empathy: em, self_orientation: so, conscientiousness: co, agency: ag, reactivity: re,
})

test('reference covers every pair, corner, single-axis entry and modifier default', () => {
  assert.equal(Object.keys(REFERENCE.pairs).length, 15)
  for (const pair of Object.values(REFERENCE.pairs)) {
    assert.deepEqual(Object.keys(pair.anchors).sort(), ['high_high', 'high_low', 'low_high', 'low_low'])
  }
  for (const axis of AXIS_ORDER) {
    assert.ok(REFERENCE.single[axis].high.name && REFERENCE.single[axis].low.name)
    assert.ok(REFERENCE.modifierDefaults[axis].summary)
  }
})

test('toEngineScores rounds once, halves up, and rejects out-of-range values', () => {
  assert.deepEqual(toEngineScores(s(5.5, 5.4, 1, 10, 7.6, 3.2)), s(6, 5, 1, 10, 8, 3))
  assert.throws(() => toEngineScores(s(0.5, 5, 5, 5, 5, 5)), RangeError)
  assert.throws(() => toEngineScores(s(Number.NaN, 5, 5, 5, 5, 5)), RangeError)
})

test('interpret refuses unrounded scores', () => {
  assert.throws(() => interpret(s(7.3, 5, 5, 5, 5, 5)), RangeError)
})

test('deterministic: same scores give an identical interpretation and cache key', () => {
  const a = interpret(s(8, 2, 9, 5, 7, 4))
  const b = interpret(s(8, 2, 9, 5, 7, 4))
  assert.deepEqual(a, b)
  assert.ok(a.cacheKey.startsWith(`${PROTOCOL_VERSION}:`))
  assert.notEqual(a.cacheKey, interpret(s(8, 2, 9, 5, 7, 5)).cacheKey)
})

test('extremity treats both ends symmetrically: 1 and 10 are equally extreme', () => {
  const r = interpret(s(1, 10, 5, 5, 5, 5))
  assert.equal(r.primary.rule, 'tied_top_pairs')
  assert.deepEqual(r.primary.axes, ['social_attunement', 'empathy'])
})

test('two axes tied for most extreme form one primary pair', () => {
  const r = interpret(s(9, 2, 6, 4, 7, 5))
  assert.equal(r.primary.type, 'pair')
  assert.equal(r.primary.rule, 'tied_top_pairs')
  assert.deepEqual(r.primary.pairs.map((p) => p.key), ['social_attunement|empathy'])
  // Equal-extremity modifiers fall back to the fixed axis order (deterministic, not meaningful).
  assert.deepEqual(r.modifiers.map((m) => m.axis), ['conscientiousness', 'agency', 'self_orientation', 'reactivity'])
  assert.deepEqual(r.modifiers.map((m) => m.rank), [1, 2, 3, 4])
})

test('three axes tied for most extreme form three co-primary pairs', () => {
  const r = interpret(s(5, 9, 2, 9, 6, 5))
  assert.equal(r.primary.type, 'co_primary_pairs')
  assert.deepEqual(r.primary.pairs.map((p) => p.key), [
    'empathy|self_orientation', 'empathy|conscientiousness', 'self_orientation|conscientiousness',
  ])
})

test('four or more tied: first three by fixed axis order, the rest become modifiers', () => {
  const r = interpret(s(9, 2, 9, 2, 6, 5))
  assert.equal(r.primary.rule, 'tied_top_reduced')
  assert.equal(r.primary.type, 'co_primary_pairs')
  assert.deepEqual(r.primary.axes, ['social_attunement', 'empathy', 'self_orientation'])
  assert.equal(r.modifiers[0].axis, 'conscientiousness')
  assert.equal(r.modifiers[0].extremity, 3.5)
})

test('one top axis pairs with a single runner-up', () => {
  const r = interpret(s(10, 8, 6, 5, 4, 5))
  assert.equal(r.primary.rule, 'top_with_runner_up')
  assert.equal(r.primary.type, 'pair')
  assert.deepEqual(r.primary.pairs.map((p) => p.key), ['social_attunement|empathy'])
})

test('one top axis pairs with each tied runner-up (up to three)', () => {
  const r = interpret(s(10, 8, 3, 5, 5, 6))
  assert.equal(r.primary.rule, 'top_with_runner_up')
  assert.equal(r.primary.type, 'co_primary_pairs')
  assert.deepEqual(r.primary.pairs.map((p) => p.key), ['social_attunement|empathy', 'social_attunement|self_orientation'])
  assert.deepEqual(r.primary.axes, ['social_attunement', 'empathy', 'self_orientation'])
})

test('single-axis reading when every runner-up is in the balanced band', () => {
  const r = interpret(s(5, 6, 10, 5, 6, 5))
  assert.equal(r.primary.type, 'single_axis')
  assert.equal(r.primary.rule, 'single_axis')
  assert.deepEqual(r.primary.pairs, [])
  // Self-Orientation's high end is Self-Focus.
  assert.deepEqual(r.primary.single && { axis: r.primary.single.axis, pole: r.primary.single.pole, name: r.primary.single.name },
    { axis: 'self_orientation', pole: 'high', name: 'the self as anchor' })
  assert.equal(r.modifiers.length, 5)
})

test('single-axis reading when four or more axes tie for runner-up', () => {
  const r = interpret(s(1, 7, 4, 7, 4, 6))
  assert.equal(r.primary.type, 'single_axis')
  assert.equal(r.primary.single?.name, 'the thin signal')
})

test('fully balanced profile follows the literal rule and is flagged for review', () => {
  const r = interpret(s(5, 6, 5, 6, 5, 6))
  assert.equal(r.primary.rule, 'tied_top_reduced')
  assert.deepEqual(r.flags, ['all_balanced'])
})

test('anchor weights interpolate, sum to 1, and reach a corner only at the extremes', () => {
  const corner = interpret(s(10, 1, 5, 5, 5, 6)).primary.pairs[0]
  assert.equal(corner.anchors[0].corner, 'high_low')
  assert.equal(corner.anchors[0].name, 'precision without concern')
  assert.equal(corner.anchors[0].weight, 1)

  const mixed = interpret(s(9, 3, 5, 5, 5, 6)).primary.pairs[0]
  const total = mixed.anchors.reduce((sum, a) => sum + a.weight, 0)
  assert.ok(Math.abs(total - 1) < 1e-3)
  assert.equal(mixed.anchors[0].corner, 'high_low')
  assert.ok(mixed.anchors[0].weight < 1 && mixed.anchors[1].weight > 0)
})

test('modifier directions scale with extremity rather than switching on and off', () => {
  const r = interpret(s(10, 1, 7, 4, 9, 2))
  const by = Object.fromEntries(r.modifiers.map((m) => [m.axis, m.signed]))
  assert.ok(by.agency > by.self_orientation && by.self_orientation > 0)
  assert.ok(by.reactivity < by.conscientiousness && by.conscientiousness < 0)
})
