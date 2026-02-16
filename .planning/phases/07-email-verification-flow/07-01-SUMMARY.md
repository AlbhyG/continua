---
phase: 07-email-verification-flow
plan: 01
subsystem: email-verification-backend
tags:
  - database-migration
  - token-generation
  - email-template
  - resend-integration
dependency_graph:
  requires:
    - 05-02 (Supabase client modules, contacts table schema)
    - 06-01 (Resend client configuration)
  provides:
    - verification_token and verification_token_expires_at columns on contacts table
    - cryptographically secure token generation (256-bit entropy)
    - branded verification email template (React Email)
    - email sending utility (Resend + React Email integration)
  affects:
    - 07-02 (Server Actions will use token generation and email sending)
    - 07-03 (Verification page will use token validation and database lookup)
tech_stack:
  added:
    - "@react-email/components@1.0.7" (email template components)
  patterns:
    - Node.js crypto.randomBytes for cryptographic token generation
    - Base64url encoding for URL-safe tokens
    - React Email component styling with inline CSS
    - Resend API integration with React Email templates
key_files:
  created:
    - supabase/migrations/00004_add_verification_columns.sql
    - src/lib/tokens/generate.ts
    - src/emails/verification-email.tsx
    - src/lib/email/send-verification.ts
  modified:
    - .env.local.example (added NEXT_PUBLIC_SITE_URL)
    - package.json (added @react-email/components)
decisions:
  - Use crypto.randomBytes(32) with base64url encoding for 43-character URL-safe tokens with 256 bits of entropy
  - Add unique constraint on verification_token to prevent collisions at database level
  - Use partial index (WHERE verification_token IS NOT NULL) for efficient token lookups
  - Add RLS SELECT policy for anon role to allow token verification without service role
  - Install only @react-email/components (not react-email dev server) since Resend renders React Email directly
  - Use inline styles in email template for email client compatibility
  - Build verification URL using NEXT_PUBLIC_SITE_URL environment variable
metrics:
  duration: 2.6 min
  tasks_completed: 2
  files_created: 4
  files_modified: 2
  completed_at: 2026-02-16
---

# Phase 7 Plan 01: Backend Infrastructure for Email Verification Summary

JWT auth with refresh rotation using jose library

## One-liner

Backend infrastructure for email verification: database columns, cryptographic token generation, branded React Email template, and Resend integration.

## What Was Built

Created the foundational backend components for email verification flow:

1. **Database Migration (00004_add_verification_columns.sql)**
   - Added `verification_token` and `verification_token_expires_at` columns to contacts table
   - Unique constraint on verification_token prevents token collisions
   - Partial index (`WHERE verification_token IS NOT NULL`) for efficient token lookups
   - RLS SELECT policy allows anonymous users to look up contacts by verification token

2. **Token Generation Utility (src/lib/tokens/generate.ts)**
   - `generateVerificationToken()`: Creates cryptographically secure 43-character base64url tokens using Node.js crypto.randomBytes(32) with 256 bits of entropy
   - `isValidTokenFormat()`: Validates token format before database lookup using regex `/^[A-Za-z0-9_-]{43}$/`

3. **React Email Template (src/emails/verification-email.tsx)**
   - Branded verification email with purple CTA button (#7C3AED)
   - Personalized greeting using recipient name
   - Clear verification instructions and 24-hour expiry notice
   - Inline styles for email client compatibility
   - Footer with "didn't request this" message

4. **Email Sending Utility (src/lib/email/send-verification.ts)**
   - Integrates Resend client with React Email template
   - Builds verification URL using NEXT_PUBLIC_SITE_URL environment variable
   - Sends email with subject "Verify your email — Continua"
   - Error handling with console logging and exception throwing

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification checks passed:

- ✓ Migration deployed successfully via `npx supabase db push`
- ✓ TypeScript compilation passes with no errors
- ✓ Token generation produces valid 43-character base64url strings
- ✓ All generated tokens are unique (cryptographically secure randomness)
- ✓ React Email package installed (@react-email/components@1.0.7)
- ✓ Build succeeds with all routes still static
- ✓ Resend client imported correctly in send utility
- ✓ React Email template integrated with Resend API

## Artifacts Delivered

### Database Schema
- `verification_token TEXT` column with UNIQUE constraint
- `verification_token_expires_at TIMESTAMPTZ` column
- Partial index: `idx_contacts_verification_token`
- RLS policy: "Allow anonymous select by verification token"

### Code Exports

**src/lib/tokens/generate.ts**
```typescript
export function generateVerificationToken(): string
export function isValidTokenFormat(token: string): boolean
```

**src/emails/verification-email.tsx**
```typescript
export default function VerificationEmail({ name, verificationUrl }: VerificationEmailProps)
```

**src/lib/email/send-verification.ts**
```typescript
export async function sendVerificationEmail({ to, name, token }: SendVerificationEmailParams)
```

## Key Links Verified

✓ `src/lib/email/send-verification.ts` imports resend from `@/lib/resend/client`
✓ `src/lib/email/send-verification.ts` uses VerificationEmail component as react prop
✓ Email template follows React Email component pattern with inline styles

## Integration Points

**For Plan 07-02 (Server Actions & Verification Page):**
- Import `generateVerificationToken` to create tokens when user signs up
- Import `sendVerificationEmail` to deliver verification emails
- Import `isValidTokenFormat` to validate token format before database lookup
- Use verification_token column for token storage and lookup

**Database Schema:**
- RLS SELECT policy allows anonymous token verification without service role
- Partial index ensures fast token lookups even with millions of contacts
- Unique constraint prevents token collision at database level

## Technical Notes

**Token Security:**
- 256 bits of entropy (crypto.randomBytes(32))
- Base64url encoding ensures URL-safe tokens (no +, /, or = characters)
- 43-character fixed length simplifies validation

**Email Template:**
- Inline styles required for email client compatibility (Gmail, Outlook, Apple Mail)
- Purple (#7C3AED) matches Continua brand color
- Pill-shaped button (border-radius: 9999px) for modern look
- White container on light gray background for visual hierarchy

**Environment Variables:**
- `NEXT_PUBLIC_SITE_URL`: Required for building verification URLs
- `RESEND_FROM_EMAIL`: Must match verified domain in Resend dashboard
- `RESEND_API_KEY`: Server-only (not prefixed with NEXT_PUBLIC_)

## Next Steps

Plan 07-02 will implement:
1. Server Action to handle signup form submission
2. Token generation and email sending on successful contact creation
3. Verification page route at `/verify/[token]`
4. Token validation and contact email_verified update
5. Automatic redirect to PDF download after verification

## Self-Check

Verifying claimed artifacts exist:

**Created files:**
- ✓ supabase/migrations/00004_add_verification_columns.sql
- ✓ src/lib/tokens/generate.ts
- ✓ src/emails/verification-email.tsx
- ✓ src/lib/email/send-verification.ts

**Modified files:**
- ✓ .env.local.example
- ✓ package.json

**Commits:**
- ✓ d48767d: feat(07-01): add verification token columns and generation utility
- ✓ 17a9e58: feat(07-01): add React Email verification template and send utility

## Self-Check: PASSED
