# Launch work handoff for Albhy

September 14, 2026. Planning handoff, not a change to the approved product scope. Read the current issue status and requirements document before starting; several decisions below are still open.

## Goal scope update

Shantam explicitly added issue #47 to the implementation goal on September 14, after confirming receipt of the contact-alias test. Contact-form PR #27 is merged and deployed; issue #18 is closed. Issue #47 covers email-first sign-in, optional one-time passkey setup, and verified account/history continuity. It does not authorize the AI/comparison work below or replacing admin-only access controls. See `docs/setup/passkeys.md` and the issue for release evidence.

## Bounded assignments suitable for Albhy's Codex

| Package | Issues | Codex deliverable | Human input / completion gate |
|---|---|---|---|
| Interaction-reference authoring | #28, #29 | Structured draft for 15 pairs × four directional anchors; six candidate modifier rules, sources, exceptions, and coverage checks. | Albhy supplies authoritative book material and approves substantive interpretations. Modifier defaults remain hypotheses until validated. |
| Deterministic interpretation and cache | #30, #31, #33 | Versioned structured schema, selection/weighting rules, cache eligibility/invalidation, bounded generation integration, deterministic and failure tests. | Decide 1–9 vs current 1–10 scores, single-most-extreme pairing, tie behavior, and source/profile fixtures before implementation. Reference validation is required, not optional. |
| Output safety and review | #32, #45 | Machine-readable rules, structured/prose checks, authored fallback integration, restricted review queue, safety-rule cache invalidation tests. | Albhy supplies/approves fallback content and banned-term starter; counsel reviews language and rules before public launch. A passing test is not legal sign-off. |
| Context history and observed range | #36–38 | Extend existing account/history model, optional context capture, min/max with session count, permissions and deletion tests. | Decide field-level encryption/key management for tags AND notes, retention, score versioning, and handling of untagged sessions. Do not infer validated contextual variance from the wording audit. |
| Consent-based comparison | #39–43 | N-capable participant model, invite/accept/decline, symmetric revoke, deterministic chart, authored narrative lookup, permission tests. | Agree snapshot vs future-data consent, access for jointly approved recipients, revocation/export boundaries, and alignment thresholds. No compatibility score or prescriptive advice. |

Start content preparation and specification fixtures in parallel conceptually, but keep implementation ownership explicit so two Codex sessions do not modify the same branch, migrations, or production settings. Each assignment should use a separate branch, concrete acceptance criteria, and a reviewable PR. Deploy only after integration and verification by the owner of the release.

## Decisions worth answering once before paying for large runs

- Score scale and historical normalization/versioning.
- What makes an interaction primary when only one axis is most extreme.
- Definition of “typical” score, aligned/divergent cutoffs, and terminology distinguishing midpoint from observed range.
- Where the referenced 137-profile dataset lives and whether authorized item-level responses exist; the checked-in famous-profile file has 105 aggregate profiles.
- How approved counselor sharing can coexist with the participant-only access rule.
- Data retention, deletion, encryption keys, provider access, privacy-request mailbox, and the legal-review owner.

## Whether a larger Codex plan is worthwhile

The engineering packages are substantial enough to benefit from additional execution capacity **if current usage limits are actually constraining work**. A more expensive plan does not resolve unclear requirements, supply validated psychological claims, approve legal language, or remove the need to inspect generated code. This handoff makes no claim about current plan pricing or entitlements; check current account usage and plan terms before recommending an upgrade.

A sensible first assignment is a small, traceable slice of the interaction reference with fixtures and a coverage report. Review its usefulness with Albhy before scaling to all 60 entries or commissioning the full generation pipeline.

## What remains out of the quick-win implementation

The AI engine and authored interaction corpus; scoring changes; new persistent context notes/encryption; mutual-consent comparisons; reminder-email campaigns; and changes to Lovely. The quick-win policy document is a review draft, not an effective policy, and the question audit supplies evidence rather than an unsupported validation conclusion.
