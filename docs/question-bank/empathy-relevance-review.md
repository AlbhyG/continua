# Empathy wording review — September 19, 2026

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
