---
phase: 08-book-pdf-downloads
plan: 01
subsystem: api
tags: [supabase, rls, pdf, next.js, route-handler]

# Dependency graph
requires:
  - phase: 07-email-verification-flow
    provides: verify_email_token RPC function, email_verified column
provides:
  - book_downloads analytics table with RLS policies for anon
  - verify_email_token RPC returns email and book_type after verification
  - Authenticated PDF download endpoint at /api/download/[book_type]
  - Placeholder PDFs in private/books/ directory
affects: [09-email-download-links, book-download-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Route Handler with anon Supabase client + RLS for authorization
    - PDF serving from private directory using fs.readFile
    - Download analytics logging with graceful degradation (log failure doesn't block download)

key-files:
  created:
    - supabase/migrations/00006_create_book_downloads_table.sql
    - supabase/migrations/00007_update_verify_email_function.sql
    - src/app/api/download/[book_type]/route.ts
    - private/books/publishers.pdf
    - private/books/agents.pdf
    - private/books/therapists.pdf
  modified: []

key-decisions:
  - "Use anon Supabase client in Route Handler with RLS policies (not service_role) for download authorization"
  - "Add RLS SELECT policy for email_verified=true contacts (enables post-verification queries from anon client)"
  - "Log download analytics with graceful degradation (don't block PDF if logging fails)"
  - "Store PDFs in private/ directory (not public/) for controlled access via Route Handler"
  - "Email query parameter acceptable for pre-launch placeholder auth (will be replaced with session-based auth)"

patterns-established:
  - "Server Route Handlers use anon client + RLS for database operations (consistent with Server Actions pattern)"
  - "Analytics/logging operations fail gracefully to avoid blocking primary user flows"
  - "Private assets served via Route Handlers with explicit auth checks before file serving"

# Metrics
duration: 2.6min
completed: 2026-02-16
---

# Phase 08 Plan 01: Book PDF Downloads Backend Summary

**Authenticated PDF download endpoint with RLS-based authorization, download analytics table, and placeholder PDFs served from private directory**

## Performance

- **Duration:** 2.6 min
- **Started:** 2026-02-16T22:07:12Z
- **Completed:** 2026-02-16T22:09:48Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created book_downloads analytics table with RLS INSERT policy for anon role
- Updated verify_email_token RPC to return email and book_type for post-verification redirect
- Built authenticated PDF download Route Handler with email verification and download logging
- Added placeholder PDFs in private/books/ directory (not publicly accessible)

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration and RPC update** - `59a1be7` (feat)
2. **Task 2: Route Handler and placeholder PDFs** - `b2cfaa5` (feat)

## Files Created/Modified

**Migrations:**
- `supabase/migrations/00006_create_book_downloads_table.sql` - Analytics table with RLS INSERT for anon, SELECT for verified contacts
- `supabase/migrations/00007_update_verify_email_function.sql` - Enhanced RPC returns email + book_type

**Route Handler:**
- `src/app/api/download/[book_type]/route.ts` - Authenticated PDF download endpoint with force-dynamic rendering

**Assets:**
- `private/books/publishers.pdf` - Placeholder PDF (570 bytes, valid PDF 1.4)
- `private/books/agents.pdf` - Placeholder PDF (569 bytes, valid PDF 1.4)
- `private/books/therapists.pdf` - Placeholder PDF (573 bytes, valid PDF 1.4)

## Decisions Made

**1. Anon client + RLS for Route Handler authorization**
- Route Handler uses `createClient()` (anon key, not service_role) for consistency with Server Actions pattern
- Required creating RLS policies for both SELECT (verified contacts) and INSERT (download logs)
- This maintains security model where anon role has limited, policy-controlled access

**2. Add RLS SELECT policy for email_verified=true**
- Existing SELECT policy only allowed `verification_token IS NOT NULL` (for verification flow)
- Post-verification queries need `email_verified=true` access (token is cleared on verification)
- Added second SELECT policy to enable download authorization without service_role escalation

**3. Graceful degradation for download logging**
- Log download to analytics table, but don't block PDF delivery if logging fails
- Maintains user experience (successful download) even if analytics has issues
- Errors logged to console for monitoring

**4. Private directory for PDFs**
- PDFs stored in `private/books/` (not `public/`) to prevent direct URL access
- Route Handler serves files only after auth check passes
- Establishes pattern for controlled asset delivery

**5. Email parameter auth acceptable for pre-launch**
- Using `?email=X` query parameter for authorization is sufficient for placeholder PDFs
- Security comment documents this will be replaced with session-based auth in production
- Simplifies Phase 8 implementation while Phase 9 (email download links) is still planned

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required. Migrations deployed automatically via `npx supabase db push`.

## Next Phase Readiness

**Ready for Phase 8 Plan 02:**
- book_downloads table exists with proper RLS policies
- verify_email_token RPC returns email and book_type for verification success page
- Download endpoint operational at /api/download/[book_type]?email=X
- Placeholder PDFs available for immediate testing

**Blockers:** None

**Integration points for next plan:**
- Verification success page can extract email + book_type from RPC response
- Download link construction: `/api/download/${book_type}?email=${email}`
- Analytics data accumulating in book_downloads table for future reporting

## Self-Check: PASSED

All files created and commits exist as documented:
- ✓ 6 files created (migrations, route handler, 3 placeholder PDFs)
- ✓ 2 commits: 59a1be7 (migrations + RPC), b2cfaa5 (route handler + PDFs)

---
*Phase: 08-book-pdf-downloads*
*Completed: 2026-02-16*
