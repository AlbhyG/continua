# Empathy wording review

## September 20: manuscript-based editorial proposal

**Hold PR #50 as a draft and keep #24 open pending author review.** The source
proposal now revises all 66 supplied additions, retained empathy row 16, and
retained detachment rows 302/323. All row numbers refer to the one-based pool at
`5029fcdb0f65cb72fc309496a9dfaeadb097317a`; no rows have been moved or reassigned.
The other 531 rows retain their exact wording and direction.

The original pass read the September 13 manuscript's Chapter 1 definitions; Chapter 3's concern,
resonance, perspective-taking, limits, and detachment sections; Chapter 4's
three-axis distinction; and Chapter 5's planning/follow-through definition.
The private Markdown copy was verified against SHA-256
`67a870771abe55c9600ddcf5c7e1400fc148eb9e1591f9ad96e77ea8cd12a86e`.
The current September 20 DOCX was subsequently fetched and rechecked: 7,243,720
bytes, SHA-256 `bfba3e9335da01876bada8df3db7a02816029904f548a077421fb4e8bb5d3089`.
Retrieve the current source via [the private-source instructions](../manuscript/README.md).
This review does not reproduce or independently verify the earlier external
review's claimed affective percentage.

### Governing distinction

Empathy scores concern about another person's suffering and motivation for its
relief. It does not score how much distress the respondent absorbs, whether they
prefer reasoning to emotion, whether they keep promises, or how much they
sacrifice their own resources. Those can be contexts or pathways, but cannot be
the reason an item counts toward either empathy pole.

`empathy-manuscript-revisions.json` is the complete row-by-row proposal, with
replacement text, rationale, pinned source, and manuscript version. Each of the
66 additions was reviewed and reworded as a first-person report. The original
email attachment remains recoverable at the pinned source commit and through
the unchanged `empathy-relevance-replacements.json` provenance.

| Concern | Resolution in the proposed bank |
| --- | --- |
| Empathy 249/288 versus detachment 302/323 | The empathy items explicitly state concern/desire for relief despite calmness; the detachment items explicitly state little concern/desire for relief. None scores emotional distance as effective helping. |
| Duty, obligation, promises, years of commitment | Replace moral compliance and reliable execution with the respondent's concern or desire for relief. Persistence refers to concern, not years of service. |
| Fairness and resource allocation | Remove optimal allocation, personal sacrifice, and fairness-follow-through claims. Row 285 asks whether suffering caused by unfair treatment matters; row 299 asks about concern for affected people. |
| Reasoning preferred over feeling (including 280) | Ask whether understanding leads to concern, without ranking reasoning above emotional pathways. |
| Retained row 16 | Describe one personal affective pathway, rather than claim that emotional connection is what makes people help. |
| Moral-failure language and abstract beliefs | Use first-person reports, avoiding tests of whether someone endorses a philosophy of caring. |

The original PR's actual detachment 302 describes becoming effective by setting
aside emotion; 323 describes helping without emotional entanglement. The review
comment paraphrases them differently, but identifies the same underlying flaw.

### Manuscript discrepancy resolved in September 20 source

The September 13 Chapter 4 Singer example conflicted with Chapter 3 by treating
limited visceral anguish as low Empathy. September 20 Chapter 4 now explicitly
places Singer at high Empathy/high Altruism despite little emotional resonance;
Chapter 3 also clarifies the principled route to empathetic concern. The source
decision is settled. A text comparison found no other paragraph changes, and
the proposed 69 revisions remain aligned; their original provenance is retained
alongside the new source recheck in the manifest. No question wording, direction,
or live instrument changed during this recheck. Pair 4 and the Layer 3 Empathy
default still require the corrections in [the follow-up review](../manuscript-followup-review.md).

### Remaining gates

- Author acceptance of the replacement wording (the definition/example discrepancy is resolved).
- A broader review of the 531 retained items: this targeted pass does not certify
  the rest of the bank. Calmness, emotional resonance, or analytical ability alone
  are not sufficient evidence of either empathy pole.
- Semantic redundancy and response-process testing. Items about abstract/distant
  suffering and calm concern remain intentionally related; unique text is not
  proof of independent measurement or absence of cross-loading.
- The target-size decision under #24 remains open. Keeping 600 items and a
  300/300 split preserves the existing proposal; it does not establish that this
  is the right assessment-bank size.
- Do not regenerate a live instrument without a separate versioning and
  validation decision. All 100 shipped questionnaires and scoring are unchanged.

Checks: 3,600 unique source questions, six 600-row pools, empathy 300/300,
unchanged other pools/live questionnaires, exact editorial membership/order and
direction, refreshed CSV/context artifacts. Current lexical tags: empathy
213/161 and detachment 229/198 (affective/cognitive, overlapping non-psychometric
tags). Empathy context candidates: 284. These checks establish integrity, not
psychometric validity.

## Historical review — September 19, 2026 (before the revisions above)

Source: Albhy's “Issue 24” email to Jason, September 19 at 07:55 PDT, attachment `axis1-empathy-detachment.json`. His [issue comment](https://github.com/AlbhyG/continua/issues/24#issuecomment-5742850034) repeats the requested scope.

Compared the full supplied pool against commit `628ae227e2943dbe3f2196c8eb58774a8330ad80` and read all 66 additions and 66 removals. Exactly 66 empathy rows are replaced; 234 empathy rows and all 300 detachment rows retain their text and direction. The attachment also groups the poles instead of preserving the interleaved order. The committed pool preserves the attachment's complete parsed content.

## Editorial findings

The additions explicitly represent reasoned concern, commitment despite low emotional intensity, and the moral relevance of distant suffering. Examples include taking another person's pain seriously without feeling it oneself, and continuing to support a cause after reasoning through why it matters. These address the pathway omission Albhy described.

The supplied wording is suitable for a reviewable source-bank proposal, but there are unresolved interpretation concerns. Row numbers below refer to the revised JSON array, one-based.

- **Opposite-pole overlap:** new empathy row 249 says thinking clearly rather than absorbing distress enables effective help; row 288 says deliberate emotional distance enables effective help. Existing detachment row 323 says it is easier to help without emotional entanglement, and row 302 says setting aside emotional reactions improves crisis effectiveness. A respondent could agree with both poles for substantially the same reason. Future revision should distinguish the weight assigned to others' suffering from emotional absorption or analytical style.
- **Pathway preference versus concern:** new empathy row 280 favors reasoning over sitting with feeling. Such preferences do not alone establish how much another person's suffering matters. Retained empathy row 16, conversely, attributes positive change to emotional connection. The revision broadens coverage but does not resolve every tension between pathways in the combined pool.
- **Construct overlap and response style:** duty, fairness, keeping promises, and consistent follow-through may also reflect Self-Orientation or Conscientiousness. Some additions assert general beliefs about what counts as caring rather than report personal behavior; others use absolute standards or moral-failure language. These deserve review before using the bank to generate a revised scored instrument.
- **Repeated meanings:** several new items express near/far equivalence, sustained commitment without emotion, or reasoned arguments motivating help. There are no exact or normalized duplicates, but exact-text checks do not establish semantic independence.

No wording was silently rewritten: the PR preserves Albhy's proposed revision and makes these concerns available for his review. His reported Chapter 3 review and ~92% affective estimate were not independently reproduced because the current manuscript and full external review are not included. Lexical tags are not evidence of psychometric balance or validity.

## Verification and provenance

- `empathy-relevance-replacements.json` records both sets of 66 items and the pinned pre-review commit; the checker enforces the exact resulting membership and unchanged detachment sequence.
- All six pools remain at 600 unique items, 3,600 total; empathy remains exactly 300/300. Normalized within-pool and exact cross-axis duplicate checks pass.
- Existing lexical minimums remain satisfied: empathy affective/cognitive tags 223/166; detachment tags 230/196. Tags overlap and do not measure manuscript-defined pathways.
- The question-bank CSV and context-screen artifacts were regenerated. Source empathy context candidates are now 282 (previously 305), reflecting wording changes, not measured contextual sensitivity.
- Other axis pools and all 100 shipped questionnaires remain unchanged. No scores or live assessment rotation change.

Issue #24 should remain open for the source-bank wording concerns and its separate target-size decision. This review does not validate or regenerate an assessment instrument.
