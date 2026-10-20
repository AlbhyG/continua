import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { build } from './build-questionnaires.mjs'

// Verifies the question bank: six pools of 180 items (90 per pole), a provenance
// manifest with a strength tag for every item, and 30 shipped questionnaires built from them.
//   node scripts/question-bank.mjs --check    # verify everything (default)
//   node scripts/question-bank.mjs --export   # rewrite docs/question-bank/question-bank.csv and counts.json
const root = path.resolve(import.meta.dirname, '..')
const poolDir = path.join(root, 'data/question-pools')
const questionnaireDir = path.join(root, 'data/questionnaires')
const reportDir = path.join(root, 'docs/question-bank')
const baseline = '4db0f6979b61a6ccaade787cf93c75f8b57cd270'
const mode = process.argv[2] ?? '--check'
assert(['--check', '--export'].includes(mode), 'Use --check or --export')

const perPole = 90
const strengths = ['mild', 'moderate', 'strong']
const csv = (rows) => rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n') + '\r\n'
const original = (file) => JSON.parse(execFileSync('git', ['show', `${baseline}:data/question-pools/${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 4_000_000 }))

// Names and score polarity follow src/lib/quiz/scoring.ts (including the reversal
// of altruism vs. self-focus). The export retains the source direction verbatim.
const axes = [
  ['axis3-social-attunement.json', 'Social Attunement', { 'hyper-attuned': 'Hyper-Attuned', 'hypo-attuned': 'Hypo-Attuned' }],
  ['axis1-empathy-detachment.json', 'Empathy–Detachment', { empathy: 'Highly Empathic', detachment: 'Detached / Analytical' }],
  ['axis2-self-orientation.json', 'Self-Orientation', { altruism: 'Altruistic / Self-Transcendent', 'self-focus': 'Self-Focused / Ambitious' }],
  ['axis4-conscientiousness.json', 'Conscientiousness', { conscientious: 'Highly Conscientious', spontaneous: 'Spontaneous' }],
  ['axis5-agency.json', 'Agency', { agentic: 'Agentic / Assertive', yielding: 'Yielding / Accommodating' }],
  ['axis6-reactivity.json', 'Reactivity', { 'high-reactive': 'Highly Reactive', 'low-reactive': 'Low Reactivity' }],
]
assert.deepEqual(fs.readdirSync(poolDir).filter((f) => f.endsWith('.json')).sort(), axes.map(([file]) => file).sort())
const manifest = JSON.parse(fs.readFileSync(path.join(reportDir, 'pool-manifest.json'), 'utf8'))
assert.deepEqual(Object.keys(manifest).sort(), axes.map(([file]) => file).sort(), 'Manifest files differ from pools')

const exported = [['axis', 'pole_direction', 'pole_label', 'strength', 'source', 'question_text', 'source_pool_file']]
const counts = []
const allTexts = []
const poolItems = new Map() // text -> { direction, strength }
for (const [file, axis, labels] of axes) {
  const rows = JSON.parse(fs.readFileSync(path.join(poolDir, file), 'utf8'))
  const meta = manifest[file]
  assert.equal(rows.length, perPole * 2, `${file}: expected ${perPole * 2} items`)
  assert.equal(meta.length, rows.length, `${file}: manifest length`)
  assert.equal(new Set(rows.map((row) => row.text)).size, rows.length, `${file}: exact duplicates`)
  assert.equal(new Set(rows.map((row) => row.text.trim().toLowerCase().replace(/\s+/g, ' '))).size, rows.length, `${file}: normalized duplicates`)
  const source = file === 'axis1-empathy-detachment.json' ? null : original(file)
  const poles = {}
  const strengthCounts = {}
  rows.forEach((row, i) => {
    assert(labels[row.direction], `Unknown direction ${row.direction}`)
    const m = meta[i]
    assert(strengths.includes(m.strength), `${file} #${i + 1}: bad strength`)
    assert(typeof m.source === 'string', `${file} #${i + 1}: missing source`)
    const baselineRow = /^baseline row (\d+)$/.exec(m.source)
    if (baselineRow) {
      assert(source, `${file} #${i + 1}: baseline source not allowed for this pool`)
      const original = source[Number(baselineRow[1]) - 1]
      assert(original && original.text === row.text && original.direction === row.direction, `${file} #${i + 1}: differs from baseline row ${baselineRow[1]}`)
    } else {
      assert(/^(new|pr50-branch row \d+( \((reworded|light edit)\))?)$/.test(m.source), `${file} #${i + 1}: unknown source "${m.source}"`)
      assert(file === 'axis1-empathy-detachment.json', `${file} #${i + 1}: only the Empathy pool may contain new or revised items`)
    }
    poles[row.direction] = (poles[row.direction] ?? 0) + 1
    const key = `${row.direction}/${m.strength}`
    strengthCounts[key] = (strengthCounts[key] ?? 0) + 1
    poolItems.set(row.text, { direction: row.direction, strength: m.strength })
    allTexts.push(row.text)
    exported.push([axis, row.direction, labels[row.direction], m.strength, m.source, row.text, file])
  })
  for (const direction of Object.keys(labels)) {
    assert.equal(poles[direction], perPole, `${file}: ${direction} pole size`)
    for (const strength of strengths) assert.equal(strengthCounts[`${direction}/${strength}`], perPole / 3, `${file}: ${direction}/${strength} count`)
  }
  counts.push({ axis, count: rows.length, unique: new Set(rows.map((row) => row.text)).size, poles, strengths: strengthCounts })
}
assert.equal(allTexts.length, 12 * perPole)
assert.equal(new Set(allTexts).size, allTexts.length, 'Cross-axis text duplicates')

// Questionnaires: 30 forms of 36 questions, 3 per pole (one per strength), every pool item used once.
const files = fs.readdirSync(questionnaireDir).filter((f) => f.endsWith('.json')).sort()
assert.equal(files.length, perPole / 3, 'Expected 30 questionnaires')
const used = new Set()
files.forEach((file, index) => {
  const q = JSON.parse(fs.readFileSync(path.join(questionnaireDir, file), 'utf8'))
  assert.equal(file, `q${String(index + 1).padStart(3, '0')}.json`)
  assert.equal(q.id, index + 1, `${file}: id`)
  assert.equal(q.questions.length, 36, `${file}: question count`)
  const byPole = {}
  for (const question of q.questions) {
    const item = poolItems.get(question.text)
    assert(item && item.direction === question.direction, `${file}: question not in pools or direction differs`)
    assert(!used.has(question.text), `${file}: item repeated across questionnaires`)
    used.add(question.text)
    ;(byPole[question.direction] ??= []).push(item.strength)
  }
  assert.equal(Object.keys(byPole).length, 12, `${file}: poles`)
  for (const [direction, list] of Object.entries(byPole)) assert.deepEqual([...list].sort(), ['mild', 'moderate', 'strong'], `${file}: ${direction} strength mix`)
})
assert.equal(used.size, allTexts.length, 'Every pool item must be used in exactly one questionnaire')
const built = build()
assert.equal(built.length, files.length)
built.forEach((q, i) => assert.equal(fs.readFileSync(path.join(questionnaireDir, files[i]), 'utf8'), JSON.stringify(q, null, 2), `${files[i]} differs from build; run scripts/build-questionnaires.mjs`))

const output = csv(exported)
if (mode === '--check') {
  assert.equal(fs.readFileSync(path.join(reportDir, 'question-bank.csv'), 'utf8'), output, 'CSV is stale; run --export')
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(reportDir, 'counts.json'), 'utf8')), counts, 'Count report is stale')
} else {
  fs.writeFileSync(path.join(reportDir, 'question-bank.csv'), output)
  fs.writeFileSync(path.join(reportDir, 'counts.json'), JSON.stringify(counts, null, 2) + '\n')
}
console.log(JSON.stringify(counts.map(({ axis, count, poles }) => ({ axis, count, poles })), null, 2))
console.log(`Verified ${allTexts.length} unique questions (12 poles x ${perPole}), a provenance manifest, and ${files.length} questionnaires of 36 built from them.`)
