# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Continua presents Albhy's personality framework and self-report assessment for self-reflection and discussion. The user has confirmed a shift from a book-pitch site toward a public launch.

## Capabilities and Constraints

The current Next.js site has chapter requests, Supabase account sign-in and passkeys, scored questionnaires, saved assessment history, and people/groups. Current scores use a 1–10 scale. Dedicated mutual-consent comparisons, context-tagged observed ranges, and generated whole-profile analysis are planned, not shipped by this quick-win task.

This task adds draft methodology/limitations disclosure and supporting audit/review documents, preserving the existing site design. Draft language must not imply legal approval, clinical validation, or completed safeguards. The privacy-policy working draft is not an effective public policy.

## Evidence on Hand

- `docs/continua-analysis-and-compare-requirements.md`: Albhy's draft launch requirements and disclaimer copy.
- `src/lib/quiz/scoring.ts`: current score calculation and axis definitions.
- `src/app/privacy/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`: incumbent document layout, site shell, and visual implementation.
- `docs/question-bank/context-audit.md`: wording evidence and limits of the available data.

## Open Decisions

Score-scale normalization; interpretation rules and reference content; comparison consent/sharing semantics; field-level encryption and retention; privacy operations; final legal approval. None is resolved by publishing draft limitations.
