---
phase: 07-email-verification-flow
plan: 02
subsystem: email-verification-frontend
tags:
  - server-actions
  - react-email
  - resend
  - two-step-verification
  - rls-security
dependency_graph:
  requires:
    - 07-01 (token generation, email sending, database columns)
    - 06-02 (SignupDialog form patterns, useActionState)
    - 05-02 (Supabase RLS policies, contacts table)
  provides:
    - requestVerificationAction for Book download flows
    - verifyEmailAction for two-step email confirmation
    - /verify/[token] verification page with format validation
    - Publishers Book dialog with email collection form
  affects:
    - 08 (Book download flows will use requestVerificationAction)
    - Future Book dialogs (Agents, Therapists) will follow Publishers pattern
tech_stack:
  added: []
  patterns:
    - Two-step verification (GET page shows button, POST completes verification) prevents email prefetching
    - INSERT with duplicate catch pattern for upsert without RLS SELECT policy
    - SECURITY DEFINER RPC function for privilege escalation on email verification
    - Controlled form inputs preserve values through Server Action submission cycle
    - Privacy-safe responses (same success message whether email exists or not)
key_files:
  created:
    - src/app/actions/request-verification.ts
    - src/app/actions/verify-email.ts
    - src/app/verify/[token]/page.tsx
    - src/app/verify/[token]/verification-form.tsx
    - supabase/migrations/00005_add_verify_email_function.sql
  modified:
    - src/components/dialogs/PublishersDialog.tsx
decisions:
  - Use INSERT with duplicate catch (23505) instead of SELECT to handle existing contacts (matches Phase 6 pattern, avoids RLS SELECT policy requirement)
  - Use SECURITY DEFINER RPC function (verify_email_token) to clear verification_token during UPDATE (RLS prevented anon client from setting token to NULL)
  - Same success response for new and existing emails (privacy-safe - prevents email enumeration)
  - Two-step verification flow (confirmation page with button) prevents token consumption by email prefetching scanners
  - Publishers dialog as proof-of-concept for Book download verification (Agents and Therapists in Phase 8)
metrics:
  duration: 204.8 min
  tasks_completed: 3
  files_created: 5
  files_modified: 1
  completed_at: 2026-02-16
---

# Phase 7 Plan 02: Email Verification Flow Summary

Complete email verification flow with two-step confirmation page, branded emails via Resend, and Publishers Book dialog integration.

## One-liner

End-to-end email verification flow: Book dialog form submission, branded verification email delivery, two-step confirmation page with prefetch protection, and SECURITY DEFINER RPC for verified email updates.

## What Was Built

Built the complete user-facing email verification flow from Book dialog submission to email confirmation:

### 1. Server Actions (Task 1)

**request-verification.ts**
- `requestVerificationAction` for Book download requests
- Validates name (1-100 chars), email, and book_type using Zod
- INSERT with duplicate catch pattern (matches Phase 6 signup)
- Generates 256-bit token via `generateVerificationToken()`
- Sets 24-hour expiry window
- Inserts book_request record (silently ignores duplicates)
- Sends branded verification email via `sendVerificationEmail()`
- Privacy-safe response (same for new/existing emails)

**verify-email.ts**
- `verifyEmailAction` for two-step confirmation
- Validates token format before database lookup
- Queries contacts by verification_token (RLS SELECT policy allows)
- Checks token expiry, returns clear error messages
- Calls SECURITY DEFINER RPC `verify_email_token()` to mark verified and clear token
- Returns success or user-friendly error (invalid, expired, already used)

### 2. Verification Page with Two-Step Flow (Task 2)

**verify/[token]/page.tsx**
- Server Component validates token format on load (does NOT consume)
- Next.js 15 async params pattern
- Invalid format shows error with guidance
- Valid format renders VerificationForm
- Glassmorphic card styling (bg-white/95, backdrop-blur, shadow)
- Metadata: "Verify Email — Continua"

**verify/[token]/verification-form.tsx**
- Client Component with useActionState
- Three states: default (Verify button), success (green checkmark), error (red alert)
- Hidden token input, explicit POST to complete verification
- "Verifying..." pending state
- Error messages include guidance to re-request if expired

**PublishersDialog.tsx**
- Updated with email collection form
- Name and email fields with Zod validation
- Hidden book_type="publishers" field
- useActionState bound to requestVerificationAction
- Success view: "Check your email" confirmation
- Matches SignupDialog styling patterns (controlled inputs, blur+change validation)

### 3. Database Security Fix (Post-Task 2 Deviation)

**00005_add_verify_email_function.sql**
- Created SECURITY DEFINER RPC function `verify_email_token(token TEXT)`
- Function runs with service role privileges
- Updates contacts SET email_verified=true, verification_token=NULL, verification_token_expires_at=NULL
- Returns BOOLEAN success
- Necessary because anon RLS UPDATE policy prevented clearing verification_token to NULL

### 4. End-to-End Verification (Task 3 - Checkpoint)

Human verified all 13 steps:
- ✓ Publishers dialog form submission
- ✓ "Check your email" confirmation
- ✓ Verification email received via Resend
- ✓ Email has branded HTML layout (purple button, white card, personalized greeting)
- ✓ Verification link URL correct (not undefined)
- ✓ Verification page loaded correctly
- ✓ "Confirm Your Email" heading with Verify button
- ✓ Clicking Verify button completed verification
- ✓ "Email Verified!" success message displayed
- ✓ Database updated: email_verified=true, verification_token=NULL
- ✓ Revisiting same link showed "invalid or already used" error
- ✓ 24-hour expiry notice in email
- ✓ User-friendly error messages with re-request guidance

## Task Commits

Each task was committed atomically:

1. **Task 1: Create request-verification and verify-email Server Actions** - `d8a42ac` (feat)
2. **Task 2: Create verification page with two-step flow and update Book dialog** - `a235307` (feat)
3. **Task 3: Verify end-to-end email verification flow** - (checkpoint) - Human verified, approved

**Security fix (post-Task 2):** `7deae80` (fix) - Added SECURITY DEFINER RPC function

## Performance

- **Duration:** 204.8 min (3.4 hours)
- **Started:** 2026-02-16T10:00:18Z
- **Completed:** 2026-02-16T13:25:07Z
- **Tasks:** 3 completed (2 auto, 1 checkpoint)
- **Files created:** 5
- **Files modified:** 1

## Files Created/Modified

**Created:**
- `src/app/actions/request-verification.ts` - Server Action to request email verification (generates token, sends email)
- `src/app/actions/verify-email.ts` - Server Action to verify email with token (two-step confirmation)
- `src/app/verify/[token]/page.tsx` - Verification page with format validation (Server Component)
- `src/app/verify/[token]/verification-form.tsx` - Confirmation form with Verify button (Client Component)
- `supabase/migrations/00005_add_verify_email_function.sql` - SECURITY DEFINER RPC for privilege escalation

**Modified:**
- `src/components/dialogs/PublishersDialog.tsx` - Added email collection form with verification flow

## Decisions Made

1. **INSERT with duplicate catch instead of SELECT:** Matches Phase 6 pattern, avoids RLS SELECT policy requirement for verified contacts (verification_token IS NULL). Attempt INSERT first, catch unique violation (23505), then UPDATE if duplicate.

2. **SECURITY DEFINER RPC function for verification:** RLS UPDATE policy prevented anon client from clearing verification_token to NULL. Created `verify_email_token(token TEXT)` RPC with SECURITY DEFINER to run with service role privileges.

3. **Privacy-safe responses:** Same success message whether email exists or not (prevents email enumeration attack).

4. **Two-step verification flow:** Confirmation page shows button (GET request doesn't consume token), clicking button completes verification (POST request). Prevents token consumption by email client prefetching scanners.

5. **Publishers dialog as proof-of-concept:** Wire one Book dialog now to validate flow. Agents and Therapists dialogs will be updated in Phase 8 when download functionality is implemented.

6. **Controlled form inputs:** Preserve field values through Server Action submission cycle (matches SignupDialog pattern from Phase 6).

7. **Blur + change validation:** Validate on blur first, then live on change after field touched (UX pattern from Phase 6).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added SECURITY DEFINER RPC function for email verification**
- **Found during:** Task 2 (testing verify-email action)
- **Issue:** RLS UPDATE policy prevented anon client from clearing verification_token to NULL. UPDATE query succeeded but did not modify the row. This is a security feature - RLS policies can prevent setting columns to certain values.
- **Fix:** Created Postgres function `verify_email_token(token TEXT)` with SECURITY DEFINER that runs with service role privileges. Function updates contacts table and returns boolean success. Updated verify-email action to call RPC instead of direct UPDATE.
- **Files modified:** src/app/actions/verify-email.ts (changed to use RPC), supabase/migrations/00005_add_verify_email_function.sql (new RPC function)
- **Verification:** Ran verification flow end-to-end - email verified successfully, token cleared, email_verified set to true. Revisiting link showed "already used" error.
- **Committed in:** 7deae80 (separate fix commit after Task 2)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking issue)
**Impact on plan:** Essential fix for correctness. RLS security feature prevented token clearing - SECURITY DEFINER RPC is the standard Postgres pattern for privilege escalation. No scope creep.

## Issues Encountered

None beyond the RLS blocking issue documented in deviations.

## User Setup Required

None - no external service configuration required. Resend integration already configured in Phase 6.

## Authentication Gates

None - all automation completed successfully.

## Verification Results

All verification checks passed:

**Task 1:**
- ✓ TypeScript compilation passes
- ✓ npm run build succeeds
- ✓ Both actions export types and functions
- ✓ INSERT with duplicate catch pattern works

**Task 2:**
- ✓ npm run build succeeds
- ✓ /verify/test-token route exists in build output
- ✓ PublishersDialog includes form with name, email, book_type fields
- ✓ VerificationForm uses useActionState with verifyEmailAction
- ✓ Glassmorphic styling matches site design

**Task 3 (Human verification):**
- ✓ All 13 verification steps passed (see Task 3 section above)
- ✓ End-to-end flow works: dialog → email → page → verified
- ✓ Two-step verification prevents prefetch consumption
- ✓ Expired tokens show clear error with guidance
- ✓ Invalid tokens show error message
- ✓ Token cleared from database after verification
- ✓ email_verified set to true
- ✓ Used tokens show "already used" error

## Artifacts Delivered

### Server Actions

**src/app/actions/request-verification.ts**
```typescript
export type RequestVerificationState = {
  errors?: { name?: string[]; email?: string[]; form?: string[] }
  success?: boolean
} | null

export async function requestVerificationAction(
  prevState: RequestVerificationState,
  formData: FormData
): Promise<RequestVerificationState>
```

**src/app/actions/verify-email.ts**
```typescript
export async function verifyEmailAction(
  prevState: any,
  formData: FormData
): Promise<{ success?: boolean; error?: string } | null>
```

### Components

**src/app/verify/[token]/page.tsx**
- Server Component with async params (Next.js 15)
- Token format validation on load
- Glassmorphic card styling
- Error state for invalid format

**src/app/verify/[token]/verification-form.tsx**
- Client Component with useActionState
- Three states: default, success, error
- Hidden token input
- Pending state with disabled button

### Database

**SECURITY DEFINER RPC function:**
```sql
CREATE OR REPLACE FUNCTION verify_email_token(token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE contacts
  SET email_verified = true,
      verification_token = NULL,
      verification_token_expires_at = NULL
  WHERE verification_token = token
    AND verification_token_expires_at > NOW();

  RETURN FOUND;
END;
$$;
```

## Key Links Verified

✓ `request-verification.ts` imports generateVerificationToken from `@/lib/tokens/generate`
✓ `request-verification.ts` imports sendVerificationEmail from `@/lib/email/send-verification`
✓ `verify-email.ts` imports isValidTokenFormat from `@/lib/tokens/generate`
✓ `verify-email.ts` calls Supabase RPC function `verify_email_token()`
✓ `page.tsx` renders VerificationForm with token prop
✓ `verification-form.tsx` uses useActionState bound to verifyEmailAction
✓ `PublishersDialog.tsx` uses useActionState bound to requestVerificationAction

## Integration Points

**For Phase 8 (Book Downloads):**
- Copy Publishers dialog pattern to Agents and Therapists dialogs
- After verification, redirect to download page or serve PDF
- Consider adding "Download Book" link to verification success page

**Security Model:**
- Two-step verification prevents prefetch scanners from consuming tokens
- SECURITY DEFINER RPC allows privilege escalation for verified email update
- Privacy-safe responses prevent email enumeration
- 24-hour token expiry reduces attack window

## Technical Notes

**Two-Step Verification:**
- GET request to `/verify/[token]` validates format, shows button (safe for prefetch)
- POST request with form submission consumes token and completes verification
- Email clients that prefetch links will load page but NOT click button
- Token remains valid until explicit button click

**RLS Security:**
- anon client can INSERT contacts (RLS policy allows)
- anon client can UPDATE verification_token when token IS NOT NULL (RLS policy allows)
- anon client CANNOT set verification_token to NULL (security restriction)
- SECURITY DEFINER RPC runs with service role privileges to bypass RLS for verification

**Error Messages:**
- Invalid token format: "This verification link is not valid. Please check the link in your email or request a new Book download."
- Expired token: "This verification link has expired. Please request a new Book download to receive a fresh link."
- Already used: "This verification link is invalid or has already been used. Please request a new Book download to receive a fresh link."

**Form Patterns:**
- Controlled inputs (value from state, onChange updates state)
- Blur validation first (set touched flag)
- Live validation on change after touched
- Preserve values through Server Action submission cycle
- Matches SignupDialog UX from Phase 6

## Next Phase Readiness

**Phase 7 Plan 03** (Email Preferences) is next - will allow users to manage email subscriptions.

**Phase 8** (Book Downloads) will:
- Copy Publishers dialog pattern to Agents and Therapists dialogs
- Serve PDFs after verification (or redirect to download page)
- Consider adding download link to verification success page
- Handle download tracking in book_requests table

**Blockers:** None

**Concerns:** None - verification flow working end-to-end

## Self-Check

Verifying claimed artifacts exist:

**Created files:**
- ✓ FOUND: src/app/actions/request-verification.ts
- ✓ FOUND: src/app/actions/verify-email.ts
- ✓ FOUND: src/app/verify/[token]/page.tsx
- ✓ FOUND: src/app/verify/[token]/verification-form.tsx
- ✓ FOUND: supabase/migrations/00005_add_verify_email_function.sql

**Modified files:**
- ✓ FOUND: src/components/dialogs/PublishersDialog.tsx

**Commits:**
- ✓ FOUND: d8a42ac (Task 1: request-verification and verify-email actions)
- ✓ FOUND: a235307 (Task 2: verification page and dialog update)
- ✓ FOUND: 7deae80 (Fix: SECURITY DEFINER RPC function)

## Self-Check: PASSED

---
*Phase: 07-email-verification-flow*
*Completed: 2026-02-16*
