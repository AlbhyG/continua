# Context wording audit

Reviewed September 14, 2026 for issue #35 and requirements §2.6.1. Scope: all six current source pools (3,600 items) and all 100 shipped questionnaires (3,600 item occurrences). No item wording, questionnaire membership, direction, or scoring code was changed.

## Finding

**There are explicit situational/contextual items on every axis. The proposed conclusion that no existing items name contexts is not supported.** This does not establish that item-to-item variance measures contextual range. Context-specific wording is only the first check; the empirical follow-up in §2.6.1 remains necessary before claiming a single-sitting range measure.

Repeated administrations can support a descriptive observed min/max across saved sessions, with the number of sessions shown. Do not call that a validated context effect, attribute a change to a tag, or infer a stable personal “bandwidth” from two observations. No “typical score” statistic or normalization change was selected in this audit.

## Reproducible screening and editorial checks

`node scripts/audit-question-context.mjs --check` verifies both committed artifacts against every current source file. `--write` regenerates the artifacts for a new editorial review.

- [context-audit.csv](context-audit.csv) includes **every occurrence**, with corpus, filename, one-based item number, axis, pole, wording, flags, and matched cues. Unflagged items are retained to make false-negative review possible.
- [context-audit-counts.json](context-audit-counts.json) contains counts and SHA-256 digests for all 106 input files.
- Screening distinguishes relationship/setting/event candidates from generic conditional wording (`when`, `if`, etc.). Neither a keyword nor a generic conditional establishes a psychometric context contrast. `no_lexical_cue` means only that these finite rules did not match, not that the sentence is context-free.
- The examples below were read in full in the source JSON, not inferred from keyword counts. They establish the presence of explicit situations; they are not a claim that every flagged item has received a full manual classification.

| Axis | Pool candidates / 600 | Live candidates / 600 |
|---|---:|---:|
| Empathy | 305 | 352 |
| Self-Orientation | 28 | 28 |
| Social Attunement | 65 | 64 |
| Conscientiousness | 26 | 26 |
| Agency | 71 | 71 |
| Reactivity | 47 | 47 |

Totals: 542 source-pool candidates; 588 live-questionnaire occurrences. These are **lexical-screen counts**, not counts of validated context probes. The source and live banks are separate artifacts: source-pool pruning did not regenerate the questionnaires. Counts must not be interpreted as a change to what people have answered.

## Manually checked examples

All item numbers are one-based array positions in `data/question-pools/`.

| Axis / file | Item | Wording | Named situation |
|---|---:|---|---|
| Empathy · `axis1-empathy-detachment.json` | 3 | In a crisis, I become more effective when I set aside emotional reactions and focus on what needs to be done. | Crisis |
| Empathy | 14 | When a friend describes a loss, I feel a strong motivation to help them recover. | Friend experiencing loss |
| Self-Orientation · `axis2-self-orientation.json` | 315 | I would skip my own vacation to cover for a coworker dealing with a family crisis. | Coworker’s family crisis |
| Self-Orientation | 380 | I find that spending an afternoon helping a friend move is more rewarding than spending it on my own pursuits. | Helping a friend move |
| Social Attunement · `axis3-social-attunement.json` | 12 | I can read the atmosphere of a meeting within seconds of walking in. | Entering a meeting |
| Social Attunement | 115 | I detect the social undercurrents at a family gathering that newcomers would miss entirely. | Family gathering |
| Conscientiousness · `axis4-conscientiousness.json` | 114 | I tend to wait until the pressure of a deadline sharpens my focus. | Deadline pressure |
| Conscientiousness | 439 | I prepare agendas before any meeting I'm responsible for. | Responsibility for a meeting |
| Agency · `axis5-agency.json` | 397 | I would rather risk overstepping than under-contributing in a crisis. | Crisis |
| Agency | 398 | I would rather check in with others than risk overstepping in a crisis. | Crisis; contrasting response, not a second context |
| Reactivity · `axis6-reactivity.json` | 272 | I tend to feel the same emotional temperature whether I'm at home or in a novel situation. | Home versus novel situation |
| Reactivity | 450 | I find that even after receiving surprising news, my body remains relaxed and my breathing stays even. | Surprising news |

Important screening limitations observed during review: Agency items 391–392 use “at home” idiomatically (feeling comfortable), not as a physical setting. Self-Orientation item 340 uses “conflict” for competing priorities, not necessarily interpersonal conflict. Some explicit meeting references, including Social Attunement item 12, are not matched by the deliberately limited setting rules. These are reasons to use the CSV as an editorial aid, not an automatic truth label.

## Why the empirical step cannot be completed from the checked-in data

The requirements reference a 137-profile database. The repository's `data/famous-figures-profiles.json` has 105 profiles containing names, tags, and aggregate scores—not per-item responses. The current quiz submission route receives answers to compute scores, but `storeResult` persists aggregate scores, questionnaire ID, ownership/token fields, and time, not the answer vector. This is a code/schema inspection, not a query of real participants' data.

Aggregate profiles cannot supply the per-item observations needed to test whether context-linked variance is systematic. Albhy should identify the intended dataset and whether it contains authorized, appropriately handled item-level responses, then approve a methodology for context coding and comparison. Do not silently add response storage or retrofit historical scores to satisfy this audit.

Issue #35's wording-audit deliverable is documented here. Its checklist item demanding confirmation of the multi-session approach as the **only** path should remain unresolved or be revised by the product owner: the document itself calls for empirical follow-up when contextual items exist. The range feature must not claim that this audit validated a single-sitting range measure or proved its impossibility.
