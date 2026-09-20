# Question-bank cleanup and manuscript-review handoff

Issue: https://github.com/AlbhyG/continua/issues/24

The source bank now contains six pools of 600 unique questions each (3,600 total). Five `-b.json` files contributed 1,500 exact duplicates of text **and direction** in their main pools and were removed. All original material remains recoverable in Git at `4db0f6979b61a6ccaade787cf93c75f8b57cd270`.

## September 19 manuscript follow-up

Albhy supplied a replacement pool in his “Issue 24” email after reporting a Claude review against Chapter 3. It replaces 66 empathy items with cognitive/principled wording, retains the other 234 empathy items and all 300 detachment items, and groups empathy before detachment. The supplied wording is preserved exactly.

`empathy-relevance-replacements.json` records the source commit, email provenance, and exact removed/added rows. The checker validates the revised membership against that pinned source and manifest, while retaining the existing balance, lexical-tag minimums, duplicate, export, and live-questionnaire checks. `--curate` intentionally refuses to overwrite this revision.

See [wording review](empathy-relevance-review.md) for remaining opposite-pole overlap and wording concerns. Albhy's manuscript review is reported evidence; the current manuscript is not bundled here and was not independently reviewed in this change. Bank-size decisions and instrument validation remain separate work under issue #24.

The selection method and `empathy-selection.csv` below document the **initial curation**, before these 66 replacements. That CSV is historical provenance, not the current membership list. Apply the replacement manifest to the pinned pre-review bank to recover the revised membership.

## Initial empathy selection

Empathy's 1,800 unique rows were introduced together in commit `6f81988`, without batch IDs or other evidence establishing separate clean generation batches. We selected 600 across the entire source instead of assuming a batch boundary. The original wording and direction are preserved.

- Exactly 300 empathy and 300 detachment items.
- Favor concise first-person reports and concrete situations; down-rank long wording, universal claims, abstract moral judgments, and assertions about what everyone should do.
- Penalize similarity to already selected wording to reduce repeated paraphrases.
- Alternate eligibility between affective-language and cognitive-language review tags, preserving at least 150 of each per pole. Tags overlap; they are lexical review aids, not validated subscales or a claim of equal psychometric coverage.
- Use source order only to break equal scores and to order the final export.

`empathy-selection.csv` records the original one-based row, direction, review tags, wording score, and text hash for every retained item. The deterministic selection and exact duplicate checks are in `scripts/question-bank.mjs`. The weights express practical editorial preferences; they are not evidence of validity. The manuscript relevance review remains necessary, especially where moral concern overlaps Self-Orientation, emotional regulation overlaps Reactivity, or analytical detachment is confused with low compassion.

## Artifacts

- `question-bank.csv`: requested columns `axis, pole_direction, pole_label, question_text, source_pool_file`; CSV quoting supports commas, quotes, and newlines.
- `counts.json`: per-axis and per-pole counts. Minor existing pole imbalances in Social Attunement and Reactivity are preserved.
- `empathy-selection.csv`: reproducible selection provenance.

Verify with `node scripts/question-bank.mjs --check`. Rebuild exports with `--export`. `--curate` reproduces the initial selection from the pinned Git baseline and refuses to overwrite subsequent editorial changes.

The app serves the 100 static files under `data/questionnaires`, not these source pools. Those questionnaire files and their scoring are unchanged; rebuilding them would change the interpretation of stored answers referencing their IDs. This cleanup reduces source-bank duplication and does not claim to change live retake rotation.

## Handoff to chat-Claude

Upload `question-bank.csv` together with the **current manuscript's Chapter 1 definitions and Chapter 3**. Suggested instruction:

> Review each question against the current axis definitions. Pay special attention to distinctions among Social Attunement, Empathy, and Self-Orientation, and to cognitive versus affective pathways within the unified Empathy axis. Flag ambiguous wording, duplicated meaning, incorrect direction, and construct overlap. Return source_pool_file, question_text, disposition (keep/reword/remove), proposed wording if applicable, and a short manuscript-grounded reason. Do not infer clinical validity or change pole labels silently. Propose balanced replacements where needed to retain 600 useful items per axis, and recommend a target size based on assessment length and retake rotation.

The current manuscript is available through the [private manuscript retrieval instructions](../manuscript/README.md). Retrieve and read it before manuscript-grounded edits. The full external review is not bundled here. Albhy reported its result on September 19; the prompt above remains available for further review. Review and version any resulting assessment changes before regenerating live questionnaires.
