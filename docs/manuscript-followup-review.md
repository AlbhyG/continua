# Manuscript follow-up review — September 20, 2026

Scope: issues #28, #29, #36 and PR #50 / #24. This is an editorial and
implementation-readiness review, not instrument validation or approval to ship
the draft reporting content. Private source: September 13 manuscript, verified
Markdown SHA-256 `67a870771abe55c9600ddcf5c7e1400fc148eb9e1591f9ad96e77ea8cd12a86e`.
Source sections reviewed: Chapter 1 definitions; Chapter 3 concern, pathways,
limits, detachment and complementarity; Chapter 4 three-axis distinction;
Chapter 5 planning/follow-through; Chapter 7 registration versus expression;
Chapter 8 configuration and contextual bandwidth.

## #50 / #24: revised source proposal, hold for author review

All 66 supplied additions now report concern/desire for relief rather than
moral doctrine, helping style, dutiful execution, or allocation of resources.
Retained rows 16/302/323 are also revised. The per-row wording and reasons are in
`question-bank/empathy-manuscript-revisions.json`; all counts, directions and
live questionnaires are preserved. See the question-bank review for limitations.

**Source decision:** Chapter 4 uses limited visceral anguish to illustrate low
Empathy in its Singer example, while Chapter 3 explicitly includes reasoned
concern. The explicit axis definitions distinguish concern from resonance.
Albhy should reconcile the example; do not silently adopt it as a scoring rule.

## #28: structural coverage complete; substantive revisions still needed

The reference contains all 15 distinct pairs, each with four anchors (60 total),
and explicitly requests interpolation rather than classification. It meets the
draft coverage requirement, but several anchors add facts that their two axes
do not establish. The following are concrete proposed replacements/constraints
for author review; the original Layer 2 draft has not been silently rewritten.

| Location | Finding | Proposed wording or constraint |
| --- | --- | --- |
| Pair 4, Empathy + Altruism | Requires felt resonance and nearly automatic sacrifice. | Concern for another's suffering combines with a tendency to prioritize others when interests compete. Concern may arise through reasoning or emotion; action remains subject to capacity and context. |
| Pair 4, Detachment + Altruism | Defines low empathy by rational rather than visceral giving, reproducing the Chapter 4 inconsistency. | Others receive priority despite relatively little personal concern about their suffering, for example through role or principle. Rational motivation alone cannot locate someone here; assess the actual level of concern separately. |
| Pair 4, Empathy + Self-Focus | Equates empathy with emotional resonance and predicts failure to act. | Others' suffering matters, while competing priorities tend toward one's own interests. Helping may still occur; its cost and context affect the choice. |
| Pair 1, Hyper-Attuned + Detachment | Treats a con-artist example as the default. | Detailed social perception with relatively little concern for others' suffering. This does not itself establish dishonesty or exploitation. |
| Pair 2, Self-Focus + Accommodating | Infers vulnerable narcissism, entitlement, and criticism sensitivity. | Personal priorities pursued through accommodation rather than assertion. These axes do not establish entitlement, vulnerability, or pathology. |
| Pair 6, Detachment + Agentic | Assigns a highest-risk predatory profile without calibrated evidence. | Assertive initiative with relatively little concern for others' suffering. Do not infer predatory intent or a clinical condition from these scores. |
| Pair 7, Detachment + High-Reactive | Label implies absence of a moral compass. | Intense internal responses with relatively little concern about others' suffering. Moral commitments and actual conduct are not determined by this pair. |
| Pair 10, Hyper-Attuned + Agentic | Adds bending facts and manipulation when neither empathy nor self-orientation is specified. | Social information informs active influence. The purpose, honesty, and beneficiary of that influence require other information. |
| Pairs 3/7/11/13/15 involving Reactivity | Several descriptions infer visible expression, emotional flatness, competence, or fixed triggers. | Describe possible internal response amplitude/duration. Expression is separately shaped by culture and learned behavior (Chapter 7); calmness does not establish effective crisis management. |
| Pairs 5/12/13 and other helping anchors | Some infer durable service or institutional effectiveness beyond the named axes. | Keep concern, allocation, and reliable execution distinct. Do not infer high Conscientiousness from altruism plus low Reactivity, or guaranteed helpful outcomes from motivation. |
| All anchors | Some use categorical predictions such as reliably, exactly, highest-risk, or most likely. | Treat the anchor as a conditional hypothesis at an endpoint. Describe uncertainty and unspecified axes; do not convert it into a verdict about a person. |

The caution about labels applies even though the text is internal: a composition
engine could otherwise reproduce those claims in a user's report. Check all 60
anchors against these constraints before approving them for generation.

## #29: six hypotheses present; proposed narrower defaults

All six axes have candidates, exceptions, and the intended ten eligible primary
pairs. Their hypothesis status is clear. Use these narrower formulations to
avoid importing an unspecified axis or overclaiming observable behavior:

| Modifier | Proposed candidate default |
| --- | --- |
| Social Attunement | Changes how much social information is detected and considered. More input does not guarantee accurate interpretation. |
| Empathy | Changes how much others' suffering matters within the primary dynamic. It does not by itself determine whose interests win or whether action follows. |
| Self-Orientation | Changes the weighting of one's own versus others' interests when priorities compete, separately from concern and capacity. |
| Conscientiousness | Changes planning and follow-through in expressing the dynamic, without determining its moral purpose. |
| Agency | Changes the tendency to initiate/assert versus accommodate, without establishing leadership competence or ethical intent. |
| Reactivity | Changes felt response amplitude and duration. Urgency, visible expression, and volatility are possible expressions, not guaranteed outputs. |

The existing Empathy default's emphasis on whose benefit the mechanism serves
duplicates Self-Orientation. Its proposed change to concern is the most important
boundary correction. The Reactivity draft itself notices felt/expressed
divergence but leaves its hypothesis dependent on their tracking together;
Chapter 7 says that dependence is unsafe as a general rule.

Validation handoff for #31: cover each modifier's ten eligible primary pairs,
including low/center/high modifier values with the primary pair fixed. Check
that the center does not inject an extreme narrative and that increasing
extremity changes only the claimed property. Include reasoned high concern/low
distress, low concern/high duty, high concern/self-priority, high internal
reactivity/low expression, and high attunement/mistaken interpretation. Record
exceptions; use per-pair modifiers when the proposed general rule fails widely.
No validation outcomes are claimed by this review.

## #36: coherent draft direction, not ready to call implemented

Extending `quiz_results`, retaining fixed optional tags, and deleting a note with
its assessment are consistent with the inspected schema. The current app writes
results through `saveQuizResult`; result/admin reads use explicit projections.
Migration 00016 also permits anonymous inserts, and its claim RPC later attaches
anonymous rows to an account. Migration 00018 adds owner-scoped deletion.
The following decisions/checks must accompany implementation:

1. **Capture boundary:** decide whether notes are only for signed-in assessments.
   If so, enforce that restriction in both the server and database paths, not
   only the UI; the existing anonymous insert policy is not a signed-in guarantee.
2. **Encryption envelope:** specify format version and key ID, randomized nonce,
   authenticated ciphertext, and a key rotation/decryption strategy. Bind the
   ciphertext to a stable assessment identity. If associated data includes
   ownership, account for anonymous claiming changing that ownership.
3. **Atomicity and failure:** define how the assessment ID is reserved before
   encryption and persist score/tag/note together or fail without reporting a
   saved note. Set note size limits and return a recoverable validation error.
4. **Read boundary:** decrypt only after checking the requesting user's ownership.
   Keep note fields out of public shares, report-generation inputs, logs, admin
   defaults, and analytics. Existing score-only projections help, but future
   read/decrypt routes still need tests; absence of a pipeline today is not proof
   of future privacy guarantees.
5. **Deletion and tests:** verify owner deletion removes the whole live row and
   another user cannot read or delete it; describe backup retention separately.
   Test wrong-key/tampered/cross-record ciphertext rejection, key rotation,
   optional/invalid tags, oversized notes, encryption failures, and direct
   anonymous access where applicable. Do not apply the illustrative migration
   verbatim without these checks and a current migration-number check.

These are implementation requirements, not reasons to alter current production
data during this review. #36 and its capture/display dependents remain open.

## Status

No issue is closed by this review. #28/#29 have structurally complete drafts
with the specific content changes above outstanding. #36 has a reviewed design
direction with implementation and verification outstanding. #50 is a revised
editorial proposal kept in draft for Albhy's decisions. Live scoring, assessment
rotation, reporting, and storage schema are unchanged by this branch.
