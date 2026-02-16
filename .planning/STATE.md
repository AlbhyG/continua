# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Visitors understand what Continua is, who it's for, and what it does — clearly enough to want to use it when the product launches.
**Current focus:** Phase 9 - Navigation & Content Restructure (in progress)

## Current Position

Phase: 9 of 9 (Navigation & Content Restructure)
Plan: 01 of 02 (Navigation Restructure)
Status: Plan complete
Last activity: 2026-02-16 — Completed 09-01 (Navigation Restructure)

Progress: [█████████░] 94% (8.5/9 phases complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 15 (6 from v1.0, 9 from v2.0)
- Average duration: 18.5 min
- Total execution time: 4.76 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Layout | 2 | - | 1.6 min |
| 2. Interactive Navigation | 1 | - | 1.6 min |
| 3. Content Pages & SEO | 2 | - | 1.6 min |
| 4. Book Dialogs | 1 | - | 1.6 min |
| 5. Supabase Foundation | 2 | 25.1 min | 12.6 min |
| 6. Notification Signup | 2 | 8.9 min | 4.5 min |
| 7. Email Verification Flow | 2 | 207.4 min | 103.7 min |
| 8. Book PDF Downloads | 2 | 17.6 min | 8.8 min |
| 9. Navigation & Content Restructure | 1 | 2.3 min | 2.3 min |

**Recent Trend:**
- v2.0 plans: 05-01 (2.1 min), 05-02 (23.0 min), 06-01 (1.9 min), 06-02 (7.0 min), 07-01 (2.6 min), 07-02 (204.8 min), 08-01 (2.6 min), 08-02 (15.0 min), 09-01 (2.3 min)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v2.0: Supabase for backend (hosted Postgres + email + Edge Functions)
- v2.0: Email only for v2.0 (simpler than email + SMS)
- v2.0: Placeholder PDFs for Book downloads (wire verification flow now, swap real PDFs later)
- 05-01: Use getUser() instead of getSession() in middleware for JWT validation (stronger security)
- 05-01: Separate client modules for browser, server, and middleware contexts (Next.js requirement)
- 05-02: Use functional index LOWER(email) for case-insensitive uniqueness (prevents duplicate emails)
- 05-02: Deploy migration via Supabase CLI (npx supabase db push) instead of SQL Editor (more reproducible)
- 05-02: Resend domain verification is non-blocking (DNS propagation 24-48h, can proceed with development)
- 06-01: Use Zod's built-in .email() validator (more robust than custom regex)
- 06-01: Transform email to trimmed lowercase in schema (matches database index)
- 06: Replace LOWER(email) expression index with column UNIQUE constraint (PostgREST compatibility)
- 06: Insert + unique violation catch instead of upsert (avoids RLS SELECT policy requirement)
- 06-02: Controlled inputs to preserve field values through Server Action submission cycle
- 06-02: Validate on blur first, then live on change after field touched
- 07-01: Use crypto.randomBytes(32) with base64url encoding for 43-character URL-safe tokens with 256 bits of entropy
- 07-01: Add unique constraint on verification_token to prevent collisions at database level
- 07-01: Use partial index (WHERE verification_token IS NOT NULL) for efficient token lookups
- 07-01: Add RLS SELECT policy for anon role to allow token verification without service role
- 07-01: Install only @react-email/components (not react-email dev server) since Resend renders React Email directly
- 07-02: Use SECURITY DEFINER RPC function (verify_email_token) to clear verification_token during UPDATE (RLS prevented anon client from setting token to NULL)
- 07-02: Two-step verification flow (confirmation page with button) prevents token consumption by email prefetching scanners
- 08-01: Use anon Supabase client in Route Handler with RLS policies (not service_role) for download authorization
- 08-01: Add RLS SELECT policy for email_verified=true contacts (enables post-verification queries from anon client)
- 08-01: Log download analytics with graceful degradation (don't block PDF if logging fails)
- 08-01: Store PDFs in private/ directory (not public/) for controlled access via Route Handler
- 08-02: Use SECURITY DEFINER RPC (upsert_contact_verification) for contact upsert — bypasses RLS visibility gap
- 08-02: Validate submit button based on field values, not blur state — enables enter-to-submit
- 08-02: Serve Book PDFs from Supabase Storage bucket instead of filesystem — easy updates without repo commits
- 09-01: Combined Who and What dropdowns into single Learn dropdown for simplified navigation
- 09-01: Used Coming Soon badges with disabled MenuItems for future features
- 09-01: Implemented permanent (308) redirects from /who and /what to maintain SEO

### Pending Todos

None yet.

### Blockers/Concerns

- Resend domain verified — ready for email sending

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed 09-01-PLAN.md (Navigation Restructure)
Resume file: Phase 9 Plan 02 next

---
*State initialized: 2026-02-11 for v1.0*
*Last updated: 2026-02-16 after 09-01 complete*
