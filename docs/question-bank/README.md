# Question bank

Issue: https://github.com/AlbhyG/continua/issues/24

The source bank has **six pools of 180 items (90 per pole, 1,080 total)**, and the app serves **30 questionnaires of 36 questions** built from them. Each questionnaire takes exactly 3 items from each of the 12 poles, one mild, one moderate and one strong, and every pool item appears in exactly one questionnaire. All original material remains recoverable in Git at `4db0f6979b61a6ccaade787cf93c75f8b57cd270`.

## Why the pools are this size

A person can take up to 30 different questionnaires without seeing an item twice (the app picks a random questionnaire they have not completed). Smaller, better-checked pools are easier to pilot and to keep equivalent across forms, which is what makes scores comparable between people who received different questionnaires.

## Empathy and Detachment

The Empathy–Detachment pool was rewritten. In review, nearly all of the earlier Detachment items described emotional composure, analytical style, or being effective in a crisis. Those describe calm and competent helping, not low concern for others' suffering, and they overlap the Reactivity axis. About four fifths of the earlier Empathy items were abstract statements about moral identity or ethical reasoning, or were close paraphrases of each other.

The current items follow these rules (paraphrased; the manuscript stays private, see `../manuscript/README.md`):

- **Empathy is concern that others' suffering matters and a wish to relieve it**, reached by feeling or by reasoning. The wish counts even if the person lacks the means to act. Actually acting is Self-Orientation (Altruism), not Empathy.
- **Low Empathy (Detachment)** items say that suffering carries little weight or little wish for relief. Composure, analytical style, being effective, and reputation are other axes or nothing.
- Wording is plain ("matters to me"), does not make emotion or its absence a condition, uses "does/tends to" rather than "can", avoids double negatives, and passes no moral judgment on either pole. The word "moral" is allowed but nothing should read as religious.
- The pool mixes feeling-led, reasoning-led, weight, wish, persistence and distance items. Route tags are in the manifest.

## Other axes

The other five axes were not rewritten. Their 90 items per pole were selected from the previous 300 by a scoring rule (concrete wording, no absolutes or superlatives, similarity penalty so paraphrases are not both chosen) and then read individually. A handful of items measuring a neighbouring construct (for example concern for suffering in an Altruism item, or a preference for directness in a Hypo-Attuned item) were swapped out. These axes have not had the full item-by-item manuscript review the Empathy pool had.

## Strength tags

Every item carries a mild / moderate / strong tag in `pool-manifest.json`, so each questionnaire is about equally demanding. **The tags for Empathy and Detachment are editorial judgments. The tags for the other axes come from a rule based on hedging and intensifier words.** Neither is evidence. After a pilot, reassign strength by each item's actual agreement rate.

## Artifacts

- `pool-manifest.json`: for every pool item, its strength, its source (`baseline row N` in the pinned baseline, `pr50-branch row N` from the earlier empathy review branch, or `new`), and for Empathy/Detachment its route tags (W weight, M wish, R reached by reasoning, F feeling-led, P persistence, S selectivity/distance).
- `question-bank.csv`: `axis, pole_direction, pole_label, strength, source, question_text, source_pool_file`.
- `counts.json`: per-axis, per-pole and per-strength counts.
- `context-audit.*`: lexical screen for situational cues over the pools and questionnaires (a screen, not a validation).

## Commands

```sh
node scripts/build-questionnaires.mjs          # rebuild data/questionnaires from the pools and manifest
node scripts/question-bank.mjs --check         # verify pools, manifest, questionnaires, reports
node scripts/question-bank.mjs --export        # rewrite question-bank.csv and counts.json
node scripts/audit-question-context.mjs --write
```

`--check` rejects: pools not 90 per pole; strength counts not 30/30/30; duplicate wording (exact, normalized or across axes); baseline-sourced items that differ from the baseline; a questionnaire that is missing, altered, or not built from the pools; and an item used twice.

## What has not been done

- **No instrument validation.** These are editorial changes, not psychometric ones. Score reliability, equivalence of the 30 forms, and the meaning of a score are untested and need a pilot.
- **Nobody but the maintainer has taken the earlier questionnaires**, so no real results depend on the old questionnaire contents. Stored results keep only scores and a questionnaire ID; the IDs 1-30 now point to different questions.
- **Lengthening or shortening the questionnaires** was considered and not done; 36 questions is retained.
