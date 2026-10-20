---
phase: 06-notification-signup
plan: 01
subsystem: backend/validation
tags: [server-action, zod, rls, validation, upsert]
dependency_graph:
  requires:
    - 05-01 (Supabase client modules)
    - 05-02 (contacts table and INSERT RLS policy)
  provides:
    - Shared Zod signup validation schema
    - Server Action for signup form submission
    - RLS UPDATE policy for upsert support
  affects:
    - 06-02 (will consume signupAction and SignupState in UI)
tech_stack:
  added:
    - zod@4.3.6 (validation library)
  patterns:
    - Shared validation between server and client
    - Privacy-safe duplicate handling via upsert
    - Generic error messages (no data leakage)
key_files:
  created:
    - src/lib/validations/signup.ts (signupSchema, SignupInput type)
    - src/app/actions/signup.ts (signupAction Server Action)
    - supabase/migrations/00002_add_contacts_update_policy.sql (RLS UPDATE policy)
  modified:
    - package.json (added zod dependency)
    - package-lock.json (lockfile update)
decisions:
  - Use Zod's built-in .email() validator (not custom regex)
  - Transform email to trimmed lowercase in schema (matches LOWER(email) index)
  - Upsert with onConflict email for privacy-safe duplicate handling
  - Generic error messages only (never reveal whether email exists)
  - Export SignupState type for useActionState client consumption
  - RLS UPDATE policy required for Supabase upsert (INSERT + UPDATE permissions)
metrics:
  duration: 111s (1.85 min)
  tasks_completed: 2
  files_created: 3
  files_modified: 2
  commits: 2
  completed_at: 2026-02-16T08:49:37Z
---

# Phase 6 Plan 01: Server-side Signup Foundation Summary

JWT auth with Zod validation, privacy-safe upsert, and RLS UPDATE policy for anonymous signup flow.

## Overview

Established the server-side foundation for notification signup by installing Zod, creating a shared validation schema, implementing a Server Action with privacy-safe duplicate handling, and adding the RLS UPDATE policy required for upsert operations.

## Tasks Completed

### Task 1: Install Zod and create shared validation schema
**Commit:** 04b8b01

**What was done:**
- Installed zod@4.3.6 for validation
- Created `src/lib/validations/signup.ts` with `signupSchema`
- Schema validates:
  - `name`: 1-100 characters, required
  - `email`: valid email format (Zod built-in), required
  - Email transform: `trim().toLowerCase()` (matches LOWER(email) database index)
- Exported `SignupInput` type for Server Action use

**Key decisions:**
- Used Zod's built-in `.email()` validator (more robust than custom regex)
- Email normalization in schema ensures consistency with database index

**Files:**
- `package.json`, `package-lock.json` (dependency added)
- `src/lib/validations/signup.ts` (new)

### Task 2: Create Server Action and RLS UPDATE policy
**Commit:** df12477

**What was done:**
- Created `src/app/actions/signup.ts` Server Action:
  - Accepts `FormData` from client
  - Validates with `signupSchema.safeParse()`
  - Upserts to `contacts` table with `onConflict: 'email'`
  - Returns `SignupState` type for `useActionState` hook
  - Generic error messages only (no email existence leakage)
- Created `supabase/migrations/00002_add_contacts_update_policy.sql`:
  - Adds RLS UPDATE policy for `anon` role on `contacts` table
  - Required because Supabase upsert needs both INSERT and UPDATE permissions
  - Deployed via `npx supabase db push`

**Key decisions:**
- Upsert with `onConflict: 'email'` handles duplicates silently (privacy-safe)
- Same success response whether email is new or existing
- Generic error messages prevent email enumeration attacks
- RLS UPDATE policy with `USING (true)` and `WITH CHECK (true)` allows upsert for anonymous users

**Files:**
- `src/app/actions/signup.ts` (new)
- `supabase/migrations/00002_add_contacts_update_policy.sql` (new)

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification criteria passed:

1. ✅ `npm ls zod` shows zod@4.3.6 installed
2. ✅ `npx tsc --noEmit` passes with no errors
3. ✅ `src/lib/validations/signup.ts` exports signupSchema and SignupInput
4. ✅ `npm run build` succeeds - Server Action compiles without errors
5. ✅ All existing routes (/, /who, /what) still prerendered as static (Server Action doesn't force dynamic)
6. ✅ `src/app/actions/signup.ts` exports signupAction and SignupState type
7. ✅ RLS migration file exists and deployed to remote database

## Success Criteria Met

- ✅ Zod installed and validation schema defines name + email rules with email lowercase transform
- ✅ Server Action accepts FormData, validates with Zod, upserts to contacts table
- ✅ Duplicate emails handled via upsert (same success response, privacy-safe)
- ✅ Generic error messages only (no email existence leakage)
- ✅ SignupState type exported for client consumption
- ✅ RLS UPDATE policy enables upsert for anonymous role
- ✅ Build passes with no errors

## Next Steps

**For Plan 02:**
- Consume `signupAction` and `SignupState` in client component
- Use `useActionState` hook for form state management
- Implement client-side on-blur validation with `signupSchema`
- Display field-level and form-level errors
- Show success state after submission

## Self-Check

Verifying all created files and commits exist.

**Created files:**
- ✅ FOUND: src/lib/validations/signup.ts
- ✅ FOUND: src/app/actions/signup.ts
- ✅ FOUND: supabase/migrations/00002_add_contacts_update_policy.sql

**Commits:**
- ✅ FOUND: 04b8b01 (Task 1: Zod and validation schema)
- ✅ FOUND: df12477 (Task 2: Server Action and RLS policy)

## Self-Check: PASSED

All files and commits verified successfully.
