---
phase: 05-supabase-foundation
plan: 02
subsystem: database
tags: [supabase, postgres, rls, middleware, resend, migrations]
dependency_graph:
  requires:
    - phase: 05-01
      provides:
        - browser-supabase-client
        - server-supabase-client
        - middleware-supabase-client
        - resend-email-client
  provides:
    - contacts-table
    - book-requests-table
    - rls-policies
    - jwt-session-refresh-middleware
    - supabase-project-configured
    - resend-account-configured
  affects: [06-notification-signup, 07-book-download, 08-admin-dashboard]
tech_stack:
  added:
    - "supabase": "Database migration CLI for automated deployment"
  patterns:
    - "Database migration pattern: SQL files in supabase/migrations/ folder"
    - "RLS pattern: Enable RLS on all tables, create explicit policies for each role"
    - "Anon INSERT-only policy: Allow anonymous users to submit data but not read/update/delete"
    - "Middleware JWT refresh: Run on every non-static request via matcher config"
key_files:
  created:
    - supabase/migrations/00001_create_contacts_and_book_requests.sql
    - middleware.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - decision: "Use functional index LOWER(email) for case-insensitive uniqueness"
    rationale: "Prevents duplicate emails with different cases, enables efficient lookups"
    impact: "contacts-table"
  - decision: "Deploy migration via Supabase CLI (npx supabase db push) instead of SQL Editor"
    rationale: "User requested CLI approach after initial checkpoint instructions. More reproducible and version-controlled."
    impact: "migration-deployment"
  - decision: "Resend domain verification is non-blocking"
    rationale: "DNS propagation can take 24-48 hours. Email functionality will work once DNS verifies, but development can continue."
    impact: "email-delivery"
metrics:
  duration_seconds: 1380
  tasks_completed: 2
  files_created: 2
  files_modified: 2
  commits: 2
  completed_at: "2026-02-16T05:33:08Z"
---

# Phase 5 Plan 02: Database Migration & Account Setup Summary

**Created contacts and book_requests tables with Row Level Security policies, configured JWT session refresh middleware, and established Supabase + Resend production accounts**

## Performance

- **Duration:** 23 min
- **Started:** 2026-02-16T05:10:05Z
- **Completed:** 2026-02-16T05:33:08Z
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 2

## Accomplishments

- Database schema deployed with contacts and book_requests tables
- Row Level Security enabled with anonymous INSERT-only policies
- Next.js middleware configured for JWT session refresh on every request
- Supabase project provisioned (US West, Free tier)
- Resend account configured with API key (custom domain DNS pending)
- Supabase CLI installed for automated migration deployment

## Task Commits

Each task was committed atomically:

1. **Task 1: Create database migration SQL and Next.js middleware** - `6cc3b15` (feat)
2. **Task 2: User creates Supabase and Resend accounts, configures environment** - Human action checkpoint (resolved)
   - Additional commit: `8c8be38` (chore) - Added Supabase CLI for migration deployment

**Note:** Task 2 was a `checkpoint:human-action` requiring user setup of external services.

## Files Created/Modified

### Created
- `supabase/migrations/00001_create_contacts_and_book_requests.sql` - Database schema with contacts and book_requests tables, RLS policies, and indexes
- `middleware.ts` - Next.js middleware for JWT session refresh using Supabase SSR helpers

### Modified
- `package.json` - Added supabase dev dependency
- `package-lock.json` - Lockfile update for supabase CLI

## Database Schema Details

### Contacts Table
- **Purpose:** Shared record for notification signups and Book requesters
- **Fields:** id, email, name, signed_up_at, email_verified, created_at, updated_at
- **Indexes:**
  - Unique constraint on LOWER(email) for case-insensitive uniqueness
  - Email lookup index for performance
- **RLS Policy:** Allow anonymous INSERT only (no SELECT/UPDATE/DELETE)

### Book Requests Table
- **Purpose:** Track which Book type (publishers, agents, therapists) was requested
- **Fields:** id, contact_id (FK), book_type (CHECK constraint), requested_at, created_at
- **Indexes:** contact_id for efficient lookups
- **RLS Policy:** Allow anonymous INSERT only
- **Cascade:** ON DELETE CASCADE for data integrity

## Middleware Configuration

- **Location:** Project root (`middleware.ts`)
- **Function:** Refreshes JWT session on every non-static request
- **Matcher:** Excludes `_next/static`, `_next/image`, `favicon.ico`, and static assets (svg, png, jpg, etc.)
- **Impact:** Existing static routes (/, /who, /what) remain static - middleware runs at request time, not build time

## Account Setup Completed

### Supabase
- **Project created:** US West region, Free tier
- **Migration deployed:** Via `npx supabase db push` (automated CLI deployment)
- **Tables verified:** contacts and book_requests visible in Table Editor
- **RLS verified:** Policies showing INSERT-only for anon role
- **Environment variables configured:** NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

### Resend
- **Account created:** API key obtained
- **Environment variable configured:** RESEND_API_KEY
- **Custom domain:** Added to Resend, DNS records configured
- **Status:** DNS verification pending (24-48h propagation time)
- **Impact:** Non-blocking - email will work once DNS propagates

## Decisions Made

1. **Case-insensitive email uniqueness via functional index** - Using `LOWER(email)` index prevents duplicate emails with different cases (user@example.com vs User@Example.com)

2. **Supabase CLI for migration deployment** - User requested CLI approach (`npx supabase db push`) instead of manual SQL Editor paste. Added supabase as dev dependency in additional commit `8c8be38`.

3. **Resend domain verification as non-blocking** - DNS propagation can take 24-48 hours. Documented as pending but allowed plan to proceed since it doesn't block development.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Supabase CLI as dev dependency**
- **Found during:** Task 2 (user setup checkpoint)
- **Issue:** User preferred automated migration deployment via CLI instead of manual SQL Editor paste
- **Fix:** Added supabase package to devDependencies, documented CLI deployment command
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx supabase db push` successfully deployed migration
- **Committed in:** 8c8be38 (separate chore commit)

---

**Total deviations:** 1 auto-fixed (blocking issue)
**Impact on plan:** Improved deployment workflow - CLI approach is more reproducible and aligns with infrastructure-as-code practices.

## Issues Encountered

None - checkpoint resolved successfully with all required accounts created and credentials configured.

## User Setup Required

**Completed during Task 2 checkpoint:**
- Supabase project created with database migration deployed
- Resend account created with API key obtained
- Environment variables configured in `.env.local` and Vercel
- Custom domain DNS verification pending (non-blocking)

## Next Phase Readiness

**Ready for Phase 6 (Notification Signup):**
- Database tables exist and accept anonymous inserts
- Middleware refreshes JWT sessions automatically
- Resend API key configured for email sending
- All existing routes still static (/, /who, /what)

**No blockers:**
- Resend domain DNS verification is pending but non-blocking
- Email delivery will work once DNS propagates (24-48 hours)
- Development can proceed immediately

## Verification Results

All success criteria met:

- [x] Database tables (contacts, book_requests) exist in Supabase with RLS enabled
- [x] RLS policies restrict anonymous users to INSERT only
- [x] Middleware refreshes JWT session on every non-static request
- [x] Existing static routes remain static after middleware addition
- [x] Supabase project configured with credentials in environment
- [x] Resend account configured with API key
- [x] Migration deployed successfully via CLI

## Self-Check

Verifying all claimed files and commits exist:

```bash
# Files created
[x] supabase/migrations/00001_create_contacts_and_book_requests.sql
[x] middleware.ts

# Files modified
[x] package.json
[x] package-lock.json

# Commits
[x] 6cc3b15 - feat(05-02): add database migration and Next.js middleware
[x] 8c8be38 - chore(05-02): add supabase CLI for database migrations
```

## Self-Check: PASSED

All files exist and all commits are present in git history.

---
*Phase: 05-supabase-foundation*
*Completed: 2026-02-16*
