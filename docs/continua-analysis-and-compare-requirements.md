# Continua: Personal Analysis & Multi-Person Comparison — Requirements

Status: draft for review
Scope: (1) individual results/analysis on a single profile, including range/bandwidth, (2) two-person comparison, (3) the compliance/disclaimer layer that wraps both. Individual analysis is specified first since it ships first; comparison builds on it.

---

## 1. Overview

Three related but distinct pieces:

- **Individual analysis** — after a user completes the six-axis assessment, the site currently shows a radar chart. This adds a natural-language description of the whole profile (Section 2.2) and, separately, a range/bandwidth feature (Section 2.6) that depends on someone having taken the test more than once.
- **Two-person comparison** — two consenting users see their profiles against each other, with a visual comparison and interpretive text about the pairing.

Both generate psychologically-flavored feedback about real people from a self-report instrument with no clinical validation, which is why Section 4 (compliance) exists and constrains tone in every section below, not just the legal boilerplate.

Sequencing notes: range/bandwidth (2.6) requires persistent auth and saved test history to exist at all — that's the same infrastructure being resolved in the current outstanding GitHub issues, so 2.6 is gated behind that work finishing. Separately, the individual-analysis generation pipeline (2.2) depends on a new piece of source content — the interaction reference described below — which doesn't exist yet and is a writing task, not an engineering one; the book itself (the other source of grounding material) is close to final, which lowers the versioning risk on that side.

---

## 2. Feature: Individual Analysis

### 2.1 Purpose

Turn a completed assessment's six scores into one natural-language description of the whole profile — not six independent blurbs stitched or listed together — displayed alongside the existing radar chart. The description is generated, but generated from reviewed source material grounding every claim it makes, not invented from the six raw numbers alone.

### 2.2 Content architecture

**The five layers, at a glance.** Layers 1–3 are authored content; Layers 4–5 govern how that content gets used at generation time. Only Layer 4's general-profile mode is in scope right now — the question-driven mode is explicitly set aside (see 2.2.2).

| Layer | Kind | What it captures |
|---|---|---|
| 1 — Dimensions | Content | The six axes and what each means independently — the book's existing axis chapters. Already written, close to final. |
| 2 — Pairwise interactions | Content | How each of the 15 axis pairs plays out across four anchor shapes (both high, both low, the two crossed directions) — ~60 entries. New, bounded writing task. |
| 3 — Higher-order interactions | Content | How a third through sixth axis modifies a primary-interaction reading. A per-axis default is a hypothesis to test against its ~10 possible pairings, not a settled architecture — genuinely general defaults and pair-dependent exceptions are both live outcomes. The hardest of the three content layers. |
| 4 — Composition protocol | Procedure | The deterministic rule for turning six raw scores into which content from Layers 2–3 applies, and in what order — rank by distance from center; the axis or axes tied for most extreme are the primary interaction(s) (ties are kept as co-primary, not forced to a single winner); the rest apply as ordered modifiers. |
| 5 — Consistency constraints | Procedure | The requirement that generation produces a structured interpretation first (via Layers 1–4), then renders that structure into prose — rather than the prose step reasoning from raw scores each time. |

#### 2.2.1 Source material

Three layers, each doing a different job:

- **Layer 1 — axis-level material (existing):** the book's six axis chapters. Close to final, so low churn expected going forward.
- **Layer 2 — an interaction reference.** A more systematic, more detailed internal document than the book's narrative prose, covering how each pair of axes interacts. Structure: for each of the 15 axis pairs (6 choose 2), four directional shapes — both high, both low, first-axis-high/second-axis-low, first-axis-low/second-axis-high — roughly 60 entries total. This is a tractable writing task (60 entries, not 531,441), and it's what gives the generation pipeline below enough systematic grounding to describe a specific pair of axes coherently, rather than relying on the book's case-study coverage, which was written for narrative purposes and doesn't systematically cover every pair. The four shapes are anchors for a continuous two-dimensional space, not a lookup table — a person's actual scores should be read as sitting somewhere between them, not forced into whichever quadrant is closest.
- **Layer 3 — higher-order interactions.** Authored principles for how additional axes modify a primary-interaction reading. This is a hypothesis to test, not a settled architecture. For each axis, write one candidate default describing its typical role as a modifier — e.g., Reactivity's default might be shifting intensity/stability, Attunement's might be shifting the information available to act on — then test that default against the roughly ten pairs it could modify (every pairing among the other five axes). If a default holds across most of those, keep it as a genuine general rule and document the occasional exception where it doesn't. If it needs exceptions for something like half or more of its contexts, that's the signal the axis's modifying role is pair-dependent rather than general, and it should be authored per relevant pair instead of forced into one default. Don't decide in advance which axes will generalize and which won't — the validation step (2.2.6) against known profiles is what actually answers that, for each axis independently.

**Governing principle: interpolate, not classify.** The four quadrant shapes in Layer 2, and the modifier effects in Layer 3, are anchors and directions in a continuous space — never a lookup table with a discrete answer. A modifier's effect should be written as a direction that scales with that axis's own extremity, not a binary presence or absence. Nothing in this system should read someone's scores, snap them to the nearest category, and stop there.

- Working name only ("therapist's reference" or similar) for Layers 2 and 3 — internal, not user-facing. They can use a more technical register than the tone rules in 2.3 allow, since those rules govern what gets *generated for users*, not this source material itself. It should not be surfaced to users, marketed, or named in any way that reads as clinical, given the not-therapy positioning in Section 4.
- The 18 axis-level bin blocks originally specced for this section (6 axes × 3 bins: low/central/high) are retained, but change role — see 2.2.4.

#### 2.2.2 Generation pipeline

Two more layers govern how the content in 2.2.1 gets used — a selection/weighting protocol, and a structuring step that runs before any prose is written:

- **Layer 4 — composition protocol.** Deterministic rules for which Layer 2/3 content applies to a given profile, and in what order. The only mode in scope right now is the general-profile case: rank the six scores by distance from center; the axis or axes tied for most extreme define the **primary interaction(s)** — look up the relevant Layer 2 entry (or entries) and interpolate between the four quadrant anchors according to where this person's actual scores fall, rather than snapping to the nearest quadrant. This is an analysis convention for producing a consistent write-up, not a claim that these dimensions are inherently more central to the person's psychology than any other interaction — the remaining axes apply as modifiers, in descending order of extremity, each via its Layer 3 role for that pairing.

  **Ties:** given a 1–9 integer scale, ties for most-extreme will be common, not a rare edge case, so they aren't forced into a single winner. Two or three axes tied for most extreme all become co-primary, and the structured interpretation (Layer 5) carries all of them without privileging one — the prose reflects that these are equally salient rather than picking a favorite. Cap explicit co-primary treatment at three tied axes; if four or more axes tie for most extreme (expected to be rare), fall back to a fixed axis order (Attunement → Empathy → Orientation → Conscientiousness → Agency → Reactivity) purely as a last-resort reducer — a deliberately unsatisfying edge case worth revisiting if it turns out to happen often, not a considered design choice.

  A second mode — selecting and weighting pairs by relevance to a specific behavioral question someone asks, rather than by extremity alone — was considered and set aside: it implies an interactive, question-driven feature this document doesn't cover, and it reopens the live-generation compliance problem the caching approach here exists to avoid. Nothing in this build should be built to support it; if that feature is greenlit later, it gets its own spec.
- **Layer 5 — consistency constraints.** Before any prose is written, Layer 4 produces a structured interpretation of the profile — which interaction(s) are primary, what each establishes, every modifier axis and its effect — rather than the prose-generation step reasoning about the six scores from scratch each time. That structured object, not the raw scores, is what gets rendered into the final paragraph. This is what actually solves the "same six scores, different story" problem: extremity ranking, with ties handled explicitly, only fixes which interactions get used, not that the write-up stays consistent run to run.

Pipeline, end to end:

- Each axis score must already be a discrete integer on the 1–9 scale before it reaches this pipeline. If the underlying assessment produces a continuous or averaged value, that gets rounded to this scale once, at profile-computation time — not reinvented at each cache lookup — so that identical profiles reliably produce identical cache keys.
- On completing an assessment, look up the six-score combination (531,441 possible combinations on a 1–9 per-axis scale) in a cache.
- **Cached:** serve the existing description.
- **Not cached:** run Layer 4 to produce the structured interpretation. Check it against the compliance rules (2.2.3) — cheaper and more reliable to check here than after it's prose. Render it into a paragraph (Layer 5). Check the rendered prose against the same rules a second time, since phrasing can introduce a problem the structure didn't have. The generation step is instructed to synthesize only from Layers 1–3 — not to invent claims those layers don't support.
- Cache both the structured interpretation and the rendered prose, keyed to the six-score combination, once both checks pass.
- In practice, real assessment-takers will cluster in a small fraction of the 531,441 possible combinations (the existing 137-profile database gives a sense of the real distribution), so this fills in lazily rather than needing bulk pre-generation before launch.
- **Timeout and failure handling:** generation and both compliance checks run under a timeout — start around 3 seconds, tuned against real latency observed during validation (2.2.6) rather than fixed here. A timeout or an unhandled exception at any step routes to the same fallback as a failed compliance check (2.2.4). The person should never see a broken page or a hung load waiting on generation.

#### 2.2.3 Compliance gate

- Runs twice: once against the structured interpretation Layer 4 produces, once against the rendered prose Layer 5 produces from it — catching logical/framing problems early, and phrasing-level problems that only show up once something is actually written out.
- Rule-based scan against the banned-language list in 2.3 (no "disorder," "treat," "fix," "manage your," etc.) and against absolute claims ("you are," "you will").
- A second check whose only job is to score the draft against the tone/framing rules in 2.3 and the disclaimer boundaries in 2.4 — does it imply diagnosis, does it imply one axis position or interaction is better than another.
- Anything that fails at either point is not cached and not shown. The person sees the fallback (2.2.4) instead, and the failure queues for a human to look at — by editing the interaction reference, the composition protocol, or the gate rules.
- **Banned-term list as a maintained file, not just prose examples.** The rule-based scan needs something deterministic to run against — maintain it as a versioned, machine-readable file (`banned_terms.json` or equivalent) rather than only the illustrative examples in 2.3, so a wording update doesn't require an engineer to also patch code, and the same file backs the scan wherever it runs (individual descriptions here, and any future compliance-gated content elsewhere in this doc, such as the comparison "translation prompts" idea noted as deferred in 3.5). A starter version, covering the terms already named in 2.3, is provided alongside this document — treat it as a first draft, not a complete or legally reviewed list (see 4.4).

#### 2.2.4 Fallback and human review

- The 18 axis-level bin blocks are no longer the primary display. They serve two roles instead: grounding material fed into generation, and the fallback shown whenever a generated description isn't available yet, times out, throws an unhandled exception, or failed the gate.
- A user should never see an error or an empty state where their description would be — only the generated description, or the axis-level fallback.

#### 2.2.5 Versioning

- Cached entries store both the structured interpretation and the rendered prose, tied to a version of the source material (Layers 1–3) and the protocol (Layer 4). A revision to Layers 1–3 or Layer 4 invalidates the structured interpretation — and therefore the prose built from it. A revision to only the prose-rendering step (Layer 5) or the tone instructions can invalidate just the rendered prose, letting it re-render from the still-valid structured interpretation without redoing the analysis — a real efficiency for a future wording-only change, like a legal-review edit to phrasing.
- Since the book is close to final, this mainly matters for Layers 2–4 while they're still being written, tested, and revised.

#### 2.2.6 Validation before broad rollout

Before trusting this pipeline on profiles nobody's checked by hand, run it against profiles you already have strong ground truth for — your own and Melanie's, or the specific configurations from the Guilty case study — and check whether the structured interpretation and the resulting prose actually match what's already been written about them. Use these profiles for more than error-catching: they're how Layer 3 actually gets discovered, not just checked. Where the pairwise model (Layer 2) alone succeeds or falls short of explaining a known person, that gap is the raw material for working out what a given axis's modifying role actually is, rather than guessing at Layer 3 content in the abstract and testing it afterward. This is also where each axis's default-vs-pair-dependent question (2.2.1) actually gets answered, and where the co-primary tie-handling (2.2.2) needs specific attention, since ties will show up often enough on a 1–9 scale that this can't be treated as a rare case nobody happens to test. Treat this as a required gate before wider rollout, not an optional nice-to-have.

### 2.3 Tone & framing rules (apply to all copy and all generated content in this feature, including 2.6)

- No pathologizing language: no "condition," "disorder," "issue," "manage your," "treat," "heal," "fix."
- Hedged, not absolute: "tend to," "often," "some people with this profile find" — never "you are" or "you will."
- No axis position, and no amount of range, is framed as better or worse than another — a wide range isn't "more evolved" and a narrow one isn't "rigid." Call the central band "wide bandwidth," not "balanced," so the poles don't read as unbalanced by implication.
- These rules are what the compliance gate (2.2.3) checks generated output against — they're enforcement criteria now, not just copywriting guidance.
- Every result page carries the disclaimer from 2.4.

### 2.4 Disclaimer requirements — individual results

Must appear directly on the results page, adjacent to the interpretive text:

- Self-reflection tool, not a diagnostic or clinical instrument.
- Not clinically validated; not a substitute for a licensed professional's assessment, diagnosis, or treatment.
- If something here concerns you, talk to a qualified professional.

Applies equally to range/bandwidth content (2.6) — see also 2.6.4 on not overclaiming precision from a small number of data points, which is a disclosure requirement in its own right, not just good UX.

(Full copy draft in Section 4.)

### 2.5 Placement

- Results page (existing radar chart): the generated whole-profile description (2.2.2) displayed below or beside the chart, with the axis-level fallback (2.2.4) shown in its place when needed.
- **New:** at the point each assessment is completed, capture a context tag for that session (see 2.6.3) before showing that session's results.
- **New:** a test-history page/section listing past sessions with their context tags and scores, since range depends on this existing somewhere a user can see it, not just a number computed silently.
- Range/bandwidth display appears on the results page once a user has 2+ sessions (2.6.4); on a first test, that section simply isn't shown yet, rather than shown empty.
- Link to a permanent "Methodology & Limitations" page from the interpretive section (Section 5).
- Authoring the interaction reference (2.2.1) is a content task that can run in parallel with engineering, but the generation pipeline needs at least a working draft of it to be built and tested against — it's a real dependency, not just supporting material.

### 2.6 Range / bandwidth

#### 2.6.1 Why this can't be extracted from the current single-sitting items

A person's answers wobbling across the several items making up one axis score only means something if those items were deliberately written to probe different contexts (e.g., "with close friends" vs. "with strangers"). If the item bank is parallel restatements of the same behavior — which is the standard design for a reliability-focused Likert battery — that wobble is measurement noise, not range, and no statistical technique applied afterward can retroactively turn it into a valid bandwidth estimate.

**Before building anything else in this section:** audit the existing item bank per axis. If any items already name a specific context, check (against the 137-profile database) whether variance across those specific items is systematic across people rather than random scatter — systematic variance tied to named context is real signal; random scatter is noise. If no items name context, skip the audit's second half — the current battery cannot support range extraction from a single administration, full stop, and the rest of this section is the path forward.

#### 2.6.2 Measurement approach: repeated, context-tagged administrations

Range comes from multiple real test administrations, each tagged with the context it was taken in. Floor and ceiling are the minimum and maximum of a person's actual scores across their saved sessions — an observed range, not a self-estimated one.

#### 2.6.3 Context tagging

- Each completed assessment gets tagged with: a short structured picker plus an optional free-text note in the user's own words (e.g., "right after a fight with my wife").
- **For MVP, the structured picker is a fixed enumerated set, not user-created custom tags** — e.g., `routine`, `high_stress`, `after_conflict`, `work`, `reflective`. A fixed set is what keeps sessions comparable across a user's own history (and, later, across users, if that's ever wanted); open-ended custom tags would defeat that comparability and complicate indexing for no real benefit at this stage. The exact category list can be revisited, but it stays product-defined, not user-extensible, for MVP.
- The structured tag is what makes categories comparable across a user's own sessions (and, later, in aggregate across users, if that's ever wanted); the free-text note is what gets shown back to the person alongside that session's scores — it's the part with the real texture, and shouldn't be discarded in favor of only the structured category.
- Both fields are optional at the point of taking the test (don't block completion on tagging), but should be prompted for, since range depends on having them.

#### 2.6.4 Minimum sample size and honest labeling

- Show range starting at 2 saved sessions — floor and ceiling are just the min and max of two points.
- Always label how many sessions the range is based on ("based on 2 tests" vs. "based on 6 tests"). This is a disclosure requirement (2.4), not just a nice-to-have: showing a range with no indication of sample size overclaims precision the data doesn't support, especially at n=2 where a single unusual day can look like a huge range.
- No fixed cap on richness as sessions accumulate — at low n, floor/ceiling is all you can honestly show; if usage patterns ever produce users with many sessions, a fuller distribution view could be considered later, but that's not an MVP requirement and shouldn't be designed for now.

#### 2.6.5 Display treatment

- **No changes to the existing radar chart.** Range does not appear as a second layer on it.
- Primary treatment: a sentence describing the range, alongside the generated description from 2.2 — e.g., "your Reactivity typically sits at 5, but has ranged from 3 to 8 across your tests (based on 4 sessions), tagged: routine day → 3, after conflict → 8." This requires no new chart component.
- Optional secondary treatment, only after the text version is shipped and validated as wanted: a small range-strip component (a shaded floor-to-ceiling band with a marked typical point, one per axis) as a separate element below the radar — not a modification of the radar itself. Not required for MVP.
- A single aggregate "how wide-ranging are you in general" badge (one line, computed from average bandwidth across axes) is a reasonable later add-on; not required for MVP.

#### 2.6.6 Dependency

Requires persistent auth and saved test history to exist first (currently in progress via the outstanding GitHub issues referenced in Section 1). Nothing in this section can ship before that lands.

#### 2.6.7 Retake encouragement

A light, non-pushy nudge to retake the assessment in a different headspace (not a hard gate, not framed as "you're not done yet") — reasonable to build on the existing Resend integration once 2.6.6 is resolved. Out of scope to design in detail here; noted so it isn't lost.

---

## 3. Feature: Two-Person Comparison

### 3.1 Purpose

Let two consenting users see their profiles compared, with a visual comparison and interpretive text about the pairing dynamic — grounded in the book's complementarity thesis, not a compatibility score.

### 3.2 Data model requirement (brief — cross-reference)

Comparisons must be modeled as N-capable from the start even though the UI ships two-person-only: a `comparisons` table plus a `comparison_participants` join table, not hard-coded `profile_a_id`/`profile_b_id` columns. The comparison math (per-axis pairwise delta) should be written as a function of two profile objects so it composes across a group later without rewriting.

**Open question (not resolved here):** once individual range data exists (Section 2.6), should a comparison ever show each person's bandwidth alongside their typical score, rather than just typical-vs-typical? Flagging this now so it's a deliberate later decision, not something bolted on ad hoc — out of scope for the current comparison spec.

**Considered and deferred:** group-aggregation math for 3+ participants (e.g., mean pairwise distance, outlier detection) was proposed and set aside. The data model above is already N-capable for exactly this reason, but the analysis and visualization layer for groups is a different problem that shouldn't be designed speculatively before a real multi-person use case exists — that's the same premature-generalization mistake the N-capable data model was built to avoid in the first place, just one layer up.

### 3.3 Consent & permissions flow

- **Double opt-in.** Person A requests a comparison with Person B; B sees what's being requested before anything is computed; results generate only after both accept.
- **Symmetric revocation.** Either party can revoke at any time; revocation removes the comparison for both sides immediately.
- **Joint consent for further sharing.** Sharing a comparison with anyone else (a counselor, a coach) requires both participants' consent, not just the initiator's.
- **No administrative override.** No role in the system can view a comparison without being one of its two consenting participants.

### 3.4 Visual design

- **Primary view: dumbbell / paired-dot chart**, one row per axis, a dot per person connected by a line — reads as a gap directly, unlike an overlaid radar where crossing lines obscure the comparison.
- **Secondary:** small radar thumbnail, two overlaid outlines, used only as a summary glyph (e.g., on a list of comparisons), not as the analysis surface.
- **Fixed axis order** in the main dumbbell view, same order every time, not reordered by gap size.
- **Gap callout** above the chart naming the axis (or two) with the largest gap, computed live, chart order unchanged.
- **Color**: each user gets one stable color, consistent across every comparison they're part of. Avoid red/green or anything implying winner/loser.

**Considered and deferred:** overlaying each person's range (a floor-to-ceiling line segment behind their dot) directly onto this chart was proposed. Not adopted yet — it pre-empties the open question in 3.2 about whether comparisons should show bandwidth at all, which was deliberately left for a later decision once individual range data actually exists. If that question resolves yes, this is the leading candidate design for it.

### 3.5 Advice content architecture

- No single compatibility score — it asserts more clinical confidence than a six-axis self-report instrument supports.
- Per-axis micro-narrative: classify each axis as **aligned** or **divergent** (with direction), show a short pre-written description of how that shape tends to function, grounded in the same dispositional-center/bandwidth language as Section 2.
- A content matrix (6 axes × a small number of pairing-shapes each), not open-ended generation — this space is small enough (unlike the six-axis combination space in 2.2) that hand-authoring remains the right call here.
- Page opens with one synthesized line naming the single largest-gap axis as the headline dynamic.

**Considered and deferred:** action-oriented "bridge" statements (e.g., "when Person A is high Reactivity and Person B is low, try...") were proposed to make this feature more actively useful. Not adopted as pre-written copy — moving from descriptive ("this combination tends to function as...") to prescriptive language is a step toward relationship advice, which Section 4 exists specifically to keep this product out of. If this direction is pursued, it needs the same compliance-gate treatment as the generated individual descriptions (2.2.3), not just more static content added to this matrix.

### 3.6 Disclaimer requirements — comparison results

In addition to Section 2.4 / Section 4 language, comparison pages need:

- Not an assessment of relationship health or compatibility; not a substitute for couples/family therapy, marriage counseling, or other professional relationship support.
- Results describe self-reported tendencies on each side, not facts about the relationship, and are not evidence about either person's character, mental health, or suitability as a partner.

Must appear on the comparison results page before the interpretive text, and again at the share-further point.

### 3.7 Placement

- New "Compare" entry point from a user's own results page.
- New invite/consent screens (3.3).
- New comparison results page: gap callout, dumbbell chart, per-axis narrative, disclaimer, share-further control (gated on joint consent).
- Comparison list page, using the radar-thumbnail glyph per comparison.

---

## 4. Cross-Cutting Compliance & Legal Requirements

I'm not a lawyer — have actual counsel review this before launch, especially given the product handles self-reported psychological data on individuals and, in comparison, on two people at once. What follows is a starting draft and placement checklist, not legal sign-off.

### 4.1 Draft core disclaimer language (needs legal review)

Short form (banner, inline on results/comparison pages):

> This is a self-reflection tool, not therapy or a clinical assessment. It isn't a substitute for professional mental health or relationship support. [Learn more →]

Long form (Methodology & Limitations page, linked from every short-form banner):

> Continua is a personality framework and self-report questionnaire intended for self-reflection and discussion. It has not been clinically validated as a diagnostic or therapeutic instrument. Results reflect how you or another participant answered a set of questions at one point in time (or, where range is shown, across a small number of your own past sessions), not a fixed or complete description of anyone's personality.
>
> Some descriptions on this site are generated from your specific combination of scores using a set of reviewed source material and automated checks, rather than written individually by a person. The same standards — no diagnostic language, no claim that any result is better or worse than another — apply to generated text as to everything else on this site.
>
> Continua is not therapy, counseling, or a medical or mental health service, and using it — alone or with someone else — is not a substitute for care from a licensed professional. If you or someone you're comparing results with is dealing with a mental health concern, relationship distress, or anything else that would benefit from professional support, please seek that support directly.
>
> Where a range is shown, it is based on the number of your own past sessions stated alongside it, and a small number of sessions produces a rough estimate, not a precise measurement.
>
> Comparison results describe two people's self-reported tendencies against each other. They are not a measure of relationship health, compatibility, or either person's character, and should not be treated as evidence for decisions about a relationship, employment, or anything else consequential.

### 4.2 Where disclaimers must appear (checklist)

| Location | Form | Notes |
|---|---|---|
| Account signup / first assessment | Full form, explicit acknowledgment required | One-time gate before first results |
| Individual results page | Short form, inline | Every visit; covers both generated and fallback descriptions |
| Range/bandwidth display | Sample-size label required whenever shown | Part of disclosure, not optional styling (2.6.4) |
| Comparison invite screen | Short form + relationship-specific line | Before either party consents |
| Comparison results page | Short form + relationship-specific line | Before interpretive text |
| Share-further flow | Short form, reiterated | At the joint-consent share action |
| Global footer | Link to Methodology & Limitations page | Site-wide |
| Methodology & Limitations page (new, static) | Full form | Single source of truth |

### 4.3 Data privacy notes

- Double opt-in and symmetric revocation (3.3) are a privacy design; document them in the privacy policy, not just the UX spec.
- Context tags and free-text notes (2.6.3) are sensitive by nature (e.g., "after a fight with my wife") — treat them with the same access restrictions as the scores themselves, and confirm whether they need a separate retention/deletion policy.
- Context tags and free-text notes must be encrypted at rest with field-level encryption, not just standard database-level encryption. Free-text notes must never be included in analytics payloads or fed into any external generation prompt without explicit sanitization — already true by construction, since the generation pipeline in 2.2.2 is keyed only on the six numeric scores, but worth stating as an explicit constraint rather than an accident of the current design.
- Cached generated descriptions (2.2.2) are derived from a user's scores but not tied to any one user once cached (they're keyed to a score combination, not a person) — worth confirming this statelessness holds in the actual implementation, since it changes what counts as personal data for retention purposes.
- GDPR/CCPA or other jurisdiction-specific consent/data-subject-rights requirements are a separate legal-review item, not addressed here.

### 4.4 Legal review flag

Recommend counsel review before launch: the disclaimer copy above, whether "not therapy" framing is sufficient or additional ToS language is needed, jurisdiction-specific requirements given self-reported personal (and arguably sensitive) data is collected about individuals and, in comparison, about two people at once — and, specifically for Section 2.2, the compliance-gate's rule set itself (2.2.3), since that ruleset is what now stands in for reviewing each individual output.

---

## 5. Site Map Summary

| Page / Route | New or existing | Contents |
|---|---|---|
| Assessment flow | existing, extended | add one-time full disclaimer acknowledgment before first results; add context-tag capture (structured + free text) at completion |
| Individual results page | existing, extended | radar chart (existing) + generated whole-profile description or fallback (2.2) + range sentence once n≥2 (2.6.5) + short disclaimer banner |
| Test history page | **new** | list of past sessions with their context tags/notes and scores — the visible record range is computed from |
| Methodology & Limitations | **new**, static | full disclaimer language (4.1) |
| Compare: invite/request | **new** | double opt-in request screen, relationship-specific disclaimer |
| Compare: accept/decline | **new** | B's view of the pending request |
| Compare: results | **new** | gap callout, dumbbell chart, radar thumbnail, per-axis narrative (3.5), disclaimer, revoke control, share-further control |
| Compare: list (if applicable) | **new** | list of a user's active comparisons |
| Global footer | existing, extended | link to Methodology & Limitations |

---

## 6. Suggested phasing / issue breakdown

Roughly in build order, once the outstanding auth/session issues are resolved:

1. Author Layer 2, the pairwise interaction reference (2.2.1) — 15 axis pairs × 4 directional shapes, ~60 entries. A content/writing task; can start immediately and run in parallel with the engineering items below.
2. Draft Layer 3 candidate defaults (2.2.1) — one hypothesis per axis for its typical modifier role. Sequenced after a working draft of Layer 2 exists. Test each against its ~10 possible pairings during validation (item 4) before treating any as settled — some may hold as general defaults, others may turn out pair-dependent.
3. Build the Layer 4 composition protocol (general-profile mode only: extremity ranking → primary interaction(s), with ties kept as co-primary rather than forced to a winner → ordered modifiers) and the Layer 5 structuring step (structured interpretation produced before any prose) (2.2.2)
4. Validate against known reference profiles (2.2.6) — this is how Layer 3 actually gets decided, not just checked: confirm or reject each axis's candidate default, add pair-specific exceptions or replace a default with pair-dependent authoring where it doesn't hold, and specifically test the co-primary tie case
5. Build the two-pass compliance gate — structured interpretation, then rendered prose (2.2.3) — and the human-review queue for anything that fails it
6. Individual analysis: results page integration — generated description as primary display, axis-level fallback wired in (2.2.4), disclaimer banner
7. Methodology & Limitations page (static)
8. Item-bank context audit for range (2.6.1) — a review task, not engineering; confirms the single-sitting approach is correctly ruled out
9. Test-history data model (per-session scores + structured tag + free-text note)
10. Context-tag capture UI in the assessment completion flow
11. Range computation + display (gated at n≥2, sample-size label required)
12. Comparison: data model (`comparisons` / `comparison_participants`, N-capable)
13. Comparison: double opt-in invite/accept/decline flow
14. Comparison: dumbbell chart + radar thumbnail component
15. Comparison: advice content matrix + copywriting pass
16. Comparison: revoke + joint-consent share-further flow
17. Retake nudge email (2.6.7) — can slot in anytime after 10
18. Legal review of all disclaimer copy and the compliance-gate rule set (4.4) — can run in parallel with the above, but gates launch
