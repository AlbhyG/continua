import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const root = path.resolve(import.meta.dirname, '..')
const poolDir = path.join(root, 'data/question-pools')
const baseline = '4db0f6979b61a6ccaade787cf93c75f8b57cd270'
const empathyFile = 'axis1-empathy-detachment.json'
const reportDir = path.join(root, 'docs/question-bank')
const mode = process.argv[2] ?? '--check'
assert(['--check', '--curate', '--export'].includes(mode), 'Use --check, --curate, or --export')
const original = (file) => JSON.parse(execFileSync('git', ['show', `${baseline}:data/question-pools/${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 4_000_000 }))
const key = (row) => `${row.direction}\u0000${row.text}`
const csv = (rows) => rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n') + '\r\n'
const hash = (text) => createHash('sha256').update(text).digest('hex')

// These overlapping tags are review aids, not psychometric subscales.
const pathways = {
  affective: /\b(feel|felt|feeling|emotional|emotionally|moved|affect|affected|resonat\w*|weigh\w*|weight|carry|caring|concern)\b/i,
  cognitive: /\b(understand\w*|perspective|recogniz\w*|think\w*|reason\w*|analy\w*|assess\w*|evaluat\w*|consider\w*|information|solutions?|decision\w*|clarity)\b/i,
}
const stopWords = new Set('i me my the a an to of and or that it is in on for as with be by from this those their them they when someone others other person people have has can do not than more most feel find believe think view hold'.split(' '))
function tokens(text) {
  return new Set((text.toLowerCase().match(/[a-z]+/g) ?? []).filter((word) => !stopWords.has(word)))
}
function quality(text) {
  const count = text.split(/\s+/).length
  let score = 3 - Math.abs(count - 20) * 0.055
  if (/^(When|After|During|If)\b/.test(text)) score += 0.8
  if (/\b(friend|conversation|listen|plans|check in|asked|shares|describe|decision|encounter)\b/i.test(text)) score += 0.6
  if (/^I (believe|hold the view|think that)/.test(text)) score -= 0.9
  if (/\b(always|never|impossible|only|everyone|every|clearest|deepest|most basic|best|should|must)\b/i.test(text)) score -= 0.8
  if (/\b(moral|morally|virtue|conscience|character|good person)\b/i.test(text)) score -= 0.6
  if (text.includes(' — ') || text.includes(';')) score -= 0.3
  return score
}
function similarity(a, b) {
  const overlap = [...a].filter((word) => b.has(word)).length
  return overlap / (a.size + b.size - overlap)
}

function selectEmpathy(rows) {
  const selected = []
  for (const direction of ['empathy', 'detachment']) {
    const candidates = rows.map((row, index) => ({ ...row, sourceRow: index + 1, tokens: tokens(row.text), quality: quality(row.text), maxSimilarity: 0 }))
      .filter((row) => row.direction === direction)
    // Alternate eligibility between pathways to retain at least 150 from each;
    // text may cover both. Greedy diversity discourages paraphrase repetition.
    for (let i = 0; i < 300; i++) {
      const pathway = i % 2 === 0 ? 'affective' : 'cognitive'
      const eligible = candidates.filter((row) => !row.selected && pathways[pathway].test(row.text))
      assert(eligible.length > 0, `Not enough ${direction}/${pathway} candidates`)
      eligible.sort((a, b) => (b.quality - 4 * b.maxSimilarity) - (a.quality - 4 * a.maxSimilarity) || a.sourceRow - b.sourceRow)
      const choice = eligible[0]
      choice.selected = true
      selected.push(choice)
      for (const row of candidates) row.maxSimilarity = Math.max(row.maxSimilarity, similarity(row.tokens, choice.tokens))
    }
  }
  return selected.sort((a, b) => a.sourceRow - b.sourceRow)
}

if (mode === '--curate') {
  const rows = original(empathyFile)
  assert.equal(rows.length, 1800)
  const selected = selectEmpathy(rows)
  const current = JSON.parse(fs.readFileSync(path.join(poolDir, empathyFile), 'utf8'))
  // Refuse to overwrite editorial work made after the baseline or this curation.
  assert([JSON.stringify(rows), JSON.stringify(selected.map(({ text, direction }) => ({ text, direction })))].includes(JSON.stringify(current)), 'Empathy pool changed; review before regenerating')
  for (const file of fs.readdirSync(poolDir).filter((file) => file.endsWith('-b.json'))) {
    const duplicate = JSON.parse(fs.readFileSync(path.join(poolDir, file), 'utf8'))
    const main = new Set(JSON.parse(fs.readFileSync(path.join(poolDir, file.replace('-b.json', '.json')), 'utf8')).map(key))
    assert.equal(duplicate.length, 300)
    assert(duplicate.every((row) => main.has(key(row))), `${file} contains unique content`)
    fs.unlinkSync(path.join(poolDir, file))
  }
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(path.join(poolDir, empathyFile), JSON.stringify(selected.map(({ text, direction }) => ({ text, direction })), null, 2) + '\n')
  fs.writeFileSync(path.join(reportDir, 'empathy-selection.csv'), csv([
    ['baseline_commit', 'source_row_1_based', 'pole_direction', 'affective_tag', 'cognitive_tag', 'wording_score', 'question_sha256'],
    ...selected.map((row) => [baseline, row.sourceRow, row.direction, pathways.affective.test(row.text), pathways.cognitive.test(row.text), row.quality.toFixed(3), hash(row.text)]),
  ]))
}

// Names and score polarity follow src/lib/quiz/scoring.ts (including the reversal
// of altruism vs. self-focus). The export retains the source direction verbatim.
const axes = [
  ['axis3-social-attunement.json', 'Social Attunement', { 'hyper-attuned': 'Hyper-Attuned', 'hypo-attuned': 'Hypo-Attuned' }],
  [empathyFile, 'Empathy–Detachment', { empathy: 'Highly Empathic', detachment: 'Detached / Analytical' }],
  ['axis2-self-orientation.json', 'Self-Orientation', { altruism: 'Altruistic / Self-Transcendent', 'self-focus': 'Self-Focused / Ambitious' }],
  ['axis4-conscientiousness.json', 'Conscientiousness', { conscientious: 'Highly Conscientious', spontaneous: 'Spontaneous' }],
  ['axis5-agency.json', 'Agency', { agentic: 'Agentic / Assertive', yielding: 'Yielding / Accommodating' }],
  ['axis6-reactivity.json', 'Reactivity', { 'high-reactive': 'Highly Reactive', 'low-reactive': 'Low Reactivity' }],
]
assert.deepEqual(fs.readdirSync(poolDir).filter((f) => f.endsWith('.json')).sort(), axes.map(([file]) => file).sort())
const exported = [['axis', 'pole_direction', 'pole_label', 'question_text', 'source_pool_file']]
const counts = []
for (const [file, axis, labels] of axes) {
  const rows = JSON.parse(fs.readFileSync(path.join(poolDir, file), 'utf8'))
  assert.equal(rows.length, 600, file)
  assert.equal(new Set(rows.map((row) => row.text)).size, 600, `${file}: exact duplicates`)
  assert.equal(new Set(rows.map((row) => row.text.trim().toLowerCase().replace(/\s+/g, ' '))).size, 600, `${file}: normalized duplicates`)
  const source = new Set(original(file).map(key))
  assert(rows.every((row) => source.has(key(row))), `${file}: wording or direction changed`)
  if (file !== empathyFile) assert.deepEqual(rows, original(file), `${file}: unexpected content change`)
  const poles = Object.fromEntries(Object.keys(labels).map((direction) => [direction, rows.filter((row) => row.direction === direction).length]))
  for (const row of rows) {
    assert(labels[row.direction], `Unknown direction ${row.direction}`)
    exported.push([axis, row.direction, labels[row.direction], row.text, file])
  }
  counts.push({ axis, count: rows.length, unique: new Set(rows.map((row) => row.text)).size, poles })
  if (file === empathyFile) {
    assert.equal(poles.empathy, 300)
    assert.equal(poles.detachment, 300)
    for (const direction of Object.keys(poles)) for (const [tag, regex] of Object.entries(pathways)) {
      const count = rows.filter((row) => row.direction === direction && regex.test(row.text)).length
      assert(count >= 150, `${direction}/${tag} coverage`)
      console.log(`Empathy review tag: ${direction}/${tag}: ${count}`)
    }
  }
}
assert.equal(exported.length - 1, 3600)
assert.equal(new Set(exported.slice(1).map((row) => row[3])).size, 3600, 'Cross-axis text duplicates')
// Shipped questionnaires are versioned assessment instruments, not rebuilt pools.
for (const file of fs.readdirSync(path.join(root, 'data/questionnaires'))) {
  if (!file.endsWith('.json')) continue
  const current = fs.readFileSync(path.join(root, 'data/questionnaires', file))
  const previous = execFileSync('git', ['show', `${baseline}:data/questionnaires/${file}`], { cwd: root })
  assert(current.equals(previous), `Live questionnaire changed: ${file}`)
}
const output = csv(exported)
if (mode === '--check') {
  assert.equal(fs.readFileSync(path.join(reportDir, 'question-bank.csv'), 'utf8'), output, 'CSV is stale; run --export')
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(reportDir, 'counts.json'), 'utf8')), counts, 'Count report is stale')
} else {
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(path.join(reportDir, 'question-bank.csv'), output)
  fs.writeFileSync(path.join(reportDir, 'counts.json'), JSON.stringify(counts, null, 2) + '\n')
}
console.log(JSON.stringify(counts, null, 2))
console.log('Verified 3,600 unique questions, six 600-row pools, and unchanged live questionnaires.')
