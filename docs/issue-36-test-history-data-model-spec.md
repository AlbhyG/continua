# Issue #36 — Test-History Data Model: Design Spec

**Status:** Draft spec, not implemented. Written against the actual current schema (read from `supabase/migrations/00011`-`00020` on `main`), not guessed - but not tested against a live Supabase instance, so treat every column name and RLS clause below as a starting point for review, not a copy-paste-ready migration.

## Scope (confirmed against Shantam's status comment on #36)

Already implemented (per #15, #22 - not part of this spec):
- Account-linked assessment history (`quiz_results.user_id`, `quiz_results.person_id`, added in `00016`)
- Full six-axis score storage (`quiz_results.scores` JSONB, added in `00012`)
- User-scoped deletion (`"Users can delete their quiz results"` RLS policy, added in `00018`)

**Still open - this spec covers:**
1. Per-session structured context tag (fixed enum, per requirements doc 2.6.3)
2. Per-session optional free-text note
3. Field-level encryption for the free-text note (4.3)
4. Retention/deletion behavior for the new fields specifically - resolved: whole-row deletion only, no field-level redaction (see section 5)

## 1. Where this lives: extend `quiz_results`, not a new table

Each row in `quiz_results` already represents one completed assessment session (one `taken_at`, one `scores` JSONB blob, owned by one `user_id`/`person_id`). Context tag and note are session-scoped, 1:1 with that row - no join table needed. Adding columns directly keeps the existing RLS policies (`SELECT`/`INSERT`/`DELETE` all scoped to `user_id = auth.uid()`) covering the new fields automatically, since they're columns on an already-protected row rather than a new table needing its own policy set.

## 2. Structured tag

```sql
ADD COLUMN IF NOT EXISTS context_tag TEXT
  CHECK (context_tag IN ('routine', 'high_stress', 'after_conflict', 'work', 'reflective'));
```

- Fixed enum via `CHECK`, not a separate lookup table - matches "not user-extensible" in the issue and keeps this a one-line addition rather than new schema surface.
- Nullable - both fields are optional at completion time per the issue and 2.6.3.
- If the category list needs to change later (the requirements doc explicitly says it can be revisited), that's a `CHECK` constraint migration, not a data migration - low cost either way.

## 3. Free-text note + field-level encryption

This is the part worth deciding deliberately rather than defaulting to "just add a TEXT column," since 4.3 is explicit that these notes need field-level encryption, not just the database-level encryption Supabase already provides at rest.

**Two real options - recommending Option A:**

**Option A (recommended): encrypt in the app layer, store ciphertext only.**
```sql
ADD COLUMN IF NOT EXISTS context_note_ciphertext TEXT,   -- base64: iv + authTag + ciphertext
ADD COLUMN IF NOT EXISTS context_note_captured_at TIMESTAMPTZ;
```
Encrypt/decrypt with AES-256-GCM in the Next.js server action that handles assessment completion, using a server-only secret (env var, never sent to the client) - the same trust boundary the app already uses for the service-role-gated book-download flow. Postgres never sees plaintext. Simple to audit: one function does the encrypt, one does the decrypt, no database-side key material to manage or rotate through Supabase.

**Option B: encrypt at the database layer with `pgcrypto` + Supabase Vault.**
Store `context_note_ciphertext BYTEA`, encrypt/decrypt via `pgp_sym_encrypt`/`pgp_sym_decrypt` inside `SECURITY DEFINER` RPC functions (consistent with the pattern already used throughout this codebase - `ensure_current_user_records`, `claim_anonymous_quiz_results`, etc.), pulling the passphrase from `vault.decrypted_secrets` rather than a literal in the function body. Keeps encryption logic in one place (the database) rather than split between app and DB, at the cost of needing Vault set up and one more RPC function to maintain.

I'd default to Option A unless there's already a reason (compliance, multi-app access to the same DB) to prefer keeping crypto inside Postgres - it's less new surface area given the app already has a clean server-only execution context for the completion flow.

## 4. Draft migration (illustrative - next number in sequence would be `00021`)

```sql
-- 00021_add_quiz_context_and_notes.sql
-- Per-session context tag and encrypted free-text note (issue #36, requirements 2.6.3)

ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS context_tag TEXT
    CHECK (context_tag IN ('routine', 'high_stress', 'after_conflict', 'work', 'reflective')),
  ADD COLUMN IF NOT EXISTS context_note_ciphertext TEXT,
  ADD COLUMN IF NOT EXISTS context_note_captured_at TIMESTAMPTZ;

-- No new RLS policies needed: these are columns on an already-owned row.
-- Existing policies already cover them:
--   "Users can insert owned quiz results" (INSERT, user_id = auth.uid())
--   "Users can read their quiz results"   (SELECT, user_id = auth.uid())
--   "Users can delete their quiz results" (DELETE, user_id = auth.uid())
-- No UPDATE policy needed either -- deletion is whole-row only (score, tag,
-- and note together), not field-level redaction. See decision below.
```

## 5. Retention / deletion - decided: whole row, together

**Decision (confirmed by Albhy):** deletion removes the score and the note together - no separate "delete just the note, keep the score" path. This matches what's already implemented: the existing `"Users can delete their quiz results"` policy already deletes the entire row (scores, tag, and note as a unit) with no changes needed. No new `UPDATE` policy or redaction RPC is needed for this feature - the whole-row `DELETE` already covers it.

Field-level encryption (Option A or B above) still matters independently of this: it's what keeps the plaintext note from being recoverable via a database dump or an over-broad service-role query before a user chooses to delete anything, which is a different guarantee than row deletion provides.

## 6. What this spec deliberately does not cover

- The context-tag capture UI (#37) and range computation/display (#38) - both consume this data model but are separate issues.
- Analytics/sanitization guarantees for free-text notes are already structurally satisfied per 4.3 ("the generation pipeline in 2.2.2 is keyed only on the six numeric scores") - nothing here changes that, since context notes were never going to be read by the generation pipeline in the first place.

