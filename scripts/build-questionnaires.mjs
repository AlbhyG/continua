import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

// Builds data/questionnaires from the source pools and docs/question-bank/pool-manifest.json.
// Each questionnaire has 36 questions: 3 from each of the 12 poles, one per strength
// (mild, moderate, strong), so every form is about equally demanding. Every pool item is
// used in exactly one questionnaire. The build is deterministic: same pools, same output.
//
//   node scripts/build-questionnaires.mjs          # write data/questionnaires/qNNN.json
//   node scripts/build-questionnaires.mjs --check  # verify files on disk match the build
const root = path.resolve(import.meta.dirname, '..')
const poolDir = path.join(root, 'data/question-pools')
const outDir = path.join(root, 'data/questionnaires')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/question-bank/pool-manifest.json'), 'utf8'))
const strengths = ['mild', 'moderate', 'strong']
const perStrength = 30
const seed = 20260920

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(seed)
function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function build() {
  const poles = new Map() // "direction|strength" -> questions
  for (const file of Object.keys(manifest).sort()) {
    const pool = JSON.parse(fs.readFileSync(path.join(poolDir, file), 'utf8'))
    assert.equal(pool.length, manifest[file].length, `${file}: pool and manifest lengths differ`)
    pool.forEach((row, i) => {
      const key = `${row.direction}|${manifest[file][i].strength}`
      if (!poles.has(key)) poles.set(key, [])
      poles.get(key).push({ text: row.text, direction: row.direction })
    })
  }
  const keys = [...poles.keys()].sort()
  assert.equal(keys.length, 12 * strengths.length, 'expected 12 poles x 3 strengths')
  const shuffled = new Map(keys.map((key) => {
    assert.equal(poles.get(key).length, perStrength, `${key}: expected ${perStrength} items`)
    return [key, shuffle(poles.get(key))]
  }))
  const questionnaires = []
  for (let n = 0; n < perStrength; n++) {
    const questions = shuffle(keys.map((key) => shuffled.get(key)[n]))
    questionnaires.push({ id: n + 1, questions })
  }
  return questionnaires
}

const name = (id) => `q${String(id).padStart(3, '0')}.json`
const render = (questionnaire) => JSON.stringify(questionnaire, null, 2)

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2] ?? '--write'
  assert(['--write', '--check'].includes(mode), 'Use --write or --check')
  const questionnaires = build()
  const expected = new Map(questionnaires.map((q) => [name(q.id), render(q)]))
  const existing = fs.existsSync(outDir) ? fs.readdirSync(outDir).filter((f) => f.endsWith('.json')) : []
  if (mode === '--check') {
    assert.deepEqual([...existing].sort(), [...expected.keys()].sort(), 'Questionnaire file list differs from build')
    for (const [file, content] of expected) {
      assert.equal(fs.readFileSync(path.join(outDir, file), 'utf8'), content, `${file} differs from build`)
    }
    console.log(`Verified ${expected.size} questionnaires match the pool build.`)
  } else {
    fs.mkdirSync(outDir, { recursive: true })
    for (const file of existing) if (!expected.has(file)) fs.unlinkSync(path.join(outDir, file))
    for (const [file, content] of expected) fs.writeFileSync(path.join(outDir, file), content)
    console.log(`Wrote ${expected.size} questionnaires.`)
  }
}
