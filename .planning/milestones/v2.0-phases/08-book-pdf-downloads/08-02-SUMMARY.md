---
phase: 08-book-pdf-downloads
plan: 02
subsystem: ui
tags: [react, dialogs, verification, download, supabase]

# Dependency graph
requires:
  - phase: 08-book-pdf-downloads
    plan: 01
    provides: /api/download/[book_type] endpoint, verify_email_token RPC with email+book_type
provides:
  - Download button on verification success page
  - Agents and Therapists dialogs with email verification flow
  - End-to-end flow from any Book dialog through verification to PDF download
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SECURITY DEFINER RPC for contact upsert (bypasses RLS visibility gap)
    - Value-based button validation (not blur-dependent)
    - Supabase Storage for PDF serving (not filesystem)

key-files:
  created: []
  modified:
    - src/app/actions/verify-email.ts
    - src/app/verify/[token]/verification-form.tsx
    - src/components/dialogs/AgentsDialog.tsx
    - src/components/dialogs/TherapistsDialog.tsx
    - src/app/actions/request-verification.ts
    - src/components/dialogs/PublishersDialog.tsx
    - src/components/dialogs/SignupDialog.tsx
    - src/app/api/download/[book_type]/route.ts
    - supabase/migrations/00008_add_upsert_contact_verification_rpc.sql
    - supabase/migrations/00009_create_books_storage_bucket.sql

key-decisions:
  - "Use SECURITY DEFINER RPC (upsert_contact_verification) for contact upsert — PostgREST requires SELECT visibility for UPDATE filters, and contacts with email_verified=false + verification_token=NULL are invisible to anon"
  - "Validate submit button based on current field values, not blur state — enables enter-to-submit without tabbing out of email field"
  - "Serve Book PDFs from Supabase Storage bucket instead of filesystem — easy to update without repo commits, no git bloat from binary files"

patterns-established:
  - "Use RPC functions (SECURITY DEFINER) when PostgREST RLS visibility gaps block standard CRUD operations"
  - "Form submit buttons validate field values directly (not touched state) for better UX"

# Metrics
duration: 15min
completed: 2026-02-16
---

# Phase 08 Plan 02: Email Download Links & Dialog Forms Summary

**Download button on verification success page, Agents/Therapists dialogs with email verification flow, and three critical bug fixes discovered during human testing**

## Performance

- **Duration:** ~15 min (including human verification and bug fixes)
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 10

## Accomplishments

- Updated verify-email action to return email and bookType from RPC response
- Added "Download [BookType] Book PDF" button to verification success page
- Converted Agents and Therapists dialogs to use email verification flow (matching Publishers pattern)
- Removed phone number input from Agents dialog (v2.0 is email-only)

## Bug Fixes During Verification

Three issues discovered and fixed during human testing:

1. **RLS visibility gap** (`b21085b`) — Contacts with `email_verified=false` AND `verification_token=NULL` were invisible to PostgREST, causing form submission to fail. Fixed with `upsert_contact_verification` RPC (SECURITY DEFINER).

2. **Submit button requires blur** (`f13c80e`) — Button stayed disabled until email field was blurred, preventing enter-to-submit. Fixed by validating field values directly instead of requiring `touched` state.

3. **PDFs in filesystem** (`49757d3`) — Moved from placeholder files in `/private/books/` to Supabase Storage bucket for easy updates without repo commits.

## Task Commits

1. **Task 1: Download button on verification page** - `d851bbc` (feat)
2. **Task 2: Agents and Therapists dialogs** - `53af0fc` (feat)
3. **Fix: RLS upsert** - `b21085b` (fix)
4. **Fix: Button validation** - `f13c80e` (fix)
5. **Storage migration** - `49757d3` (feat)

## Deviations from Plan

- Added migration 00008 (upsert_contact_verification RPC) — not in original plan, required by RLS bug
- Added migration 00009 (books storage bucket) — upgraded from filesystem to Supabase Storage
- Fixed submit button validation across all 4 dialogs (including SignupDialog from Phase 6)
- Fixed NEXT_PUBLIC_SITE_URL port mismatch (3002 → 3000)

## Issues Encountered

- RLS visibility gap was the primary blocker — contacts created during Phase 6 signup had no SELECT policy coverage
- The fix pattern (SECURITY DEFINER RPC) is consistent with existing verify_email_token approach

## Self-Check: PASSED

- ✓ Download button appears on verification success page with correct /api/download/ URL
- ✓ Agents dialog has name+email form with book_type="agents"
- ✓ Therapists dialog has name+email form with book_type="therapists"
- ✓ PDFs download from Supabase Storage (3.3MB real book)
- ✓ Build passes with no TypeScript errors
- ✓ All commits present and pushed

---
*Phase: 08-book-pdf-downloads*
*Completed: 2026-02-16*
