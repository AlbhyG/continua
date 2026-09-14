import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

// Reproducible lexical screening, not a psychometric classifier. Every item,
// including unflagged items, is exported so an editor can review false negatives.
const root = path.resolve(import.meta.dirname, '..')
const mode = process.argv[2] ?? '--check'
assert(['--write', '--check'].includes(mode), 'Use --write or --check')
const axisFor = {
  empathy: 'Empathy', detachment: 'Empathy', altruism: 'Self-Orientation', 'self-focus': 'Self-Orientation',
  'hyper-attuned': 'Social Attunement', 'hypo-attuned': 'Social Attunement', conscientious: 'Conscientiousness',
  spontaneous: 'Conscientiousness', agentic: 'Agency', yielding: 'Agency', 'high-reactive': 'Reactivity', 'low-reactive': 'Reactivity',
}
const cues = {
  relationship: /\b(friends?|friendship|family|families|partner|spouse|wife|husband|colleagues?|coworkers?|strangers?|children|child|parents?|loved ones?|close to me)\b/gi,
  setting: /\b(at work|at home|workplace|in (?:a |an |the )?(?:group|meeting|crowd|conversation|discussion|crisis|emergency)|social (?:gathering|setting|situation)|teams?)\b/gi,
  event: /\b(criticis\w*|criticiz\w*|conflicts?|arguments?|disagreements?|setbacks?|rejection|rejected|deadlines?|under pressure|surprising news|unexpected|interrupted|interruptions?|emergenc\w*|crisis|crises|stress\w*|mistakes?|failures?|suffering|difficult time|bad news)\b/gi,
  conditional_only: /\b(when|whenever|after|before|during|if)\b/gi,
}
const sources = [
  ['source_pool', 'data/question-pools'],
  ['live_questionnaire', 'data/questionnaires'],
]
const items = []
const sourceDigests = []
for (const [corpus, dir] of sources) {
  for (const file of fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith('.json')).sort()) {
    const relative = `${dir}/${file}`
    const bytes = fs.readFileSync(path.join(root, relative))
    sourceDigests.push({ file: relative, sha256: createHash('sha256').update(bytes).digest('hex') })
    const parsed = JSON.parse(bytes)
    const questions = Array.isArray(parsed) ? parsed : parsed.questions
    for (const [index, question] of questions.entries()) {
      assert(axisFor[question.direction], `Unmapped direction: ${question.direction}`)
      const matches = Object.fromEntries(Object.entries(cues).map(([name, regex]) => [name, [...new Set(question.text.match(regex) ?? [])]]))
      const contextual = ['relationship', 'setting', 'event'].filter(name => matches[name].length)
      const flags = contextual.length ? contextual : matches.conditional_only.length ? ['conditional_only'] : []
      items.push({ corpus, file: relative, row: index + 1, axis: axisFor[question.direction], direction: question.direction,
        screen: contextual.length ? 'context_candidate' : flags.length ? 'conditional_only' : 'no_lexical_cue',
        flags: flags.join('; '), evidence: flags.flatMap(name => matches[name]).join('; '), text: question.text })
    }
  }
}
const csv = rows => rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n') + '\r\n'
const summary = {
  method: 'lexical-screen-v1; candidates require editorial review; no_lexical_cue does not establish absence of context',
  sources: sourceDigests,
  counts: sources.flatMap(([corpus]) => [...new Set(Object.values(axisFor))].map(axis => {
    const rows = items.filter(item => item.corpus === corpus && item.axis === axis)
    return { corpus, axis, total: rows.length, context_candidates: rows.filter(r => r.screen === 'context_candidate').length,
      conditional_only: rows.filter(r => r.screen === 'conditional_only').length, no_lexical_cue: rows.filter(r => r.screen === 'no_lexical_cue').length }
  })),
}
const headers = ['corpus', 'file', 'row', 'axis', 'direction', 'screen', 'flags', 'evidence', 'text']
const outputs = {
  'context-audit.csv': csv([headers, ...items.map(item => headers.map(h => item[h]))]),
  'context-audit-counts.json': JSON.stringify(summary, null, 2) + '\n',
}
for (const [file, content] of Object.entries(outputs)) {
  const target = path.join(root, 'docs/question-bank', file)
  if (mode === '--write') fs.writeFileSync(target, content)
  else assert.equal(fs.readFileSync(target, 'utf8'), content, `${file} is stale; run --write and review`)
}
console.table(summary.counts)
console.log(`${items.length} item occurrences screened across ${sourceDigests.length} files; no source items or scores changed.`)
