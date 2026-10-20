---
phase: 06-notification-signup
plan: 02
subsystem: frontend/dialog
tags: [signup-dialog, validation, aria, headless-ui, server-action]
dependency_graph:
  requires:
    - 06-01 (signupAction, SignupState, signupSchema)
  provides:
    - SignupDialog component with form, validation, ARIA, confirmation
    - Header Sign In/Up button wired to dialog
  affects:
    - 07-xx (email verification will extend confirmation flow)
tech_stack:
  patterns:
    - useActionState for Server Action form integration
    - Controlled inputs with client-side validation
    - ARIA live regions for screen reader announcements
    - Headless UI Dialog for accessible modal
key_files:
  created:
    - src/components/dialogs/SignupDialog.tsx (signup form with validation and confirmation)
  modified:
    - src/components/layout/Header.tsx (added Sign In/Up button and SignupDialog)
    - src/app/actions/signup.ts (switched from upsert to insert + duplicate catch)
    - supabase/migrations/00003_fix_email_unique_constraint.sql (column-level unique for PostgREST)
decisions:
  - Controlled inputs to preserve field values through submission cycle
  - Insert + unique violation catch (23505) instead of upsert (avoids RLS SELECT requirement)
  - Validate on blur first, then live on change after field touched (best UX)
  - Column-level UNIQUE constraint instead of LOWER(email) expression index (PostgREST compatibility)
metrics:
  duration: ~420s (7 min, including debugging)
  tasks_completed: 3
  files_created: 1
  files_modified: 3
  commits: 5
  completed_at: 2026-02-16T09:10:00Z
---

# Phase 6 Plan 02: SignupDialog UI with Validation Summary

Accessible signup dialog with live validation, ARIA error announcements, and database persistence via Server Action.

## Overview

Built the user-facing SignupDialog component with on-blur + live-on-change validation, ARIA live regions for screen readers, and a confirmation view on successful submission. Wired the Header's Sign In/Up button to open the dialog. Fixed database integration issues discovered during human verification.

## Tasks Completed

### Task 1: Create SignupDialog component
**Commit:** 26be921

**What was done:**
- Created `src/components/dialogs/SignupDialog.tsx` as Client Component
- Headless UI Dialog matching existing dialog pattern (PublishersDialog)
- `useActionState` for Server Action integration
- Client-side validation using shared `signupSchema`
- Two views: form view and "Check your email" confirmation view
- ARIA attributes: `role="alert"`, `aria-live="polite"`, `aria-invalid`, `aria-describedby`
- Submit button disabled until both fields touched and valid

### Task 2: Wire Header Sign In/Up button
**Commit:** b91fd22

**What was done:**
- Added `SignupDialog` import and `showSignup` state to Header
- Changed "Sign In" button text to "Sign In / Up" (requirement NAV-03)
- Added `onClick` handler to open dialog
- Rendered `SignupDialog` alongside existing dialogs

### Task 3: Human verification checkpoint
**Status:** Approved by user

**Verification confirmed:**
- Dialog opens from header button
- Validation shows errors on blur and clears live on typing
- Successful submission shows "Check your email" confirmation
- Data persists in Supabase contacts table
- Dialog closes via click outside or Escape

## Deviations from Plan

### 1. Expression index → column unique constraint
**Issue:** `LOWER(email)` expression-based unique index incompatible with PostgREST's `onConflict: 'email'`
**Fix:** Migration 00003 replaces with standard `UNIQUE (email)` constraint
**Commit:** e0affcc

### 2. Upsert → insert with duplicate catch
**Issue:** Upsert required SELECT RLS policy for PostgREST response handling
**Fix:** Switched to `.insert()` with unique violation catch (code 23505) — silently succeeds on duplicate
**Commit:** f83b69a

### 3. Live validation on typing
**User request:** Validate while typing, not just on blur
**Fix:** Added `onChange` handler that validates after field has been touched once via blur
**Commit:** 2caf1b3

### 4. Controlled inputs
**Issue:** Form fields cleared after Server Action submission (React resets uncontrolled forms)
**Fix:** Switched to controlled inputs with `value` state to preserve field values on error
**Commit:** f83b69a

## Self-Check

**Created files:**
- ✅ FOUND: src/components/dialogs/SignupDialog.tsx

**Modified files:**
- ✅ FOUND: src/components/layout/Header.tsx
- ✅ FOUND: src/app/actions/signup.ts
- ✅ FOUND: supabase/migrations/00003_fix_email_unique_constraint.sql

**Commits:**
- ✅ 26be921 feat(06-02): create SignupDialog with validation and confirmation
- ✅ b91fd22 feat(06-02): wire Header Sign In/Up button to SignupDialog
- ✅ e0affcc fix(06): replace LOWER(email) expression index with column unique constraint
- ✅ 2caf1b3 feat(06): validate signup fields on typing after first blur
- ✅ f83b69a fix(06): use controlled inputs and insert with duplicate handling

## Self-Check: PASSED
