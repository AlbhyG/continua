# Phase 7: Email Verification Flow - Research

**Researched:** 2026-02-16
**Domain:** Email verification, transactional emails, secure token management
**Confidence:** HIGH

## Summary

Email verification for Book downloads requires a two-step flow to prevent link prefetching by corporate security scanners. The phase builds on existing Supabase + Resend infrastructure (Phase 5) and notification signup flow (Phase 6) to create a secure verification system.

**Core pattern:** Generate cryptographically secure token → Store with expiry in database → Send branded email with link to confirmation page → User clicks button on page → Verify token and mark email verified → Enable Book download access.

The two-step approach (link to page + button click) is critical because corporate email security tools (Microsoft Defender Safe Links, Barracuda, etc.) automatically prefetch/click links in emails to scan for threats. A direct verification link would be consumed by scanners before users see it. Landing on a confirmation page that requires a deliberate button click prevents token consumption by automated systems.

**Primary recommendation:** Use custom email verification tokens stored in database (not Supabase Auth's built-in email verification) because Book downloads don't require full authentication—just proof of email ownership. Store tokens in `contacts` table with `verification_token`, `verification_token_expires_at`, and `email_verified` columns. Use Resend with React Email for branded templates. Implement two-step flow: `/verify/[token]` page with "Confirm Your Email" button that calls Server Action to complete verification.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| crypto (Node.js) | Built-in | Secure token generation | Industry standard CSPRNG via `randomBytes()`, no external dependencies |
| Resend | 6.9.2+ | Email delivery | Already configured (Phase 5), developer-friendly API, integrates with React Email |
| React Email | Latest | Email templates | Official Resend companion, type-safe React components for emails, excellent DX |
| Zod | 4.3.6+ | Validation | Already in use (Phase 6), runtime type safety for token validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pg_cron (Supabase) | Built-in extension | Expired token cleanup | Schedule daily cleanup jobs in database, zero external infrastructure |
| Next.js Server Actions | 15+ | Token verification mutations | Already pattern in use (Phase 6), type-safe server mutations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom tokens | Supabase Auth email verification | Supabase Auth requires full user accounts/sessions. Custom tokens are lighter weight for simple email verification + gated downloads |
| Resend + React Email | Supabase email templates (Go templates) | Supabase templates work but React Email provides better DX, type safety, and template testing. Already using Resend, so consistent with existing infrastructure |
| Database cleanup cron | Application-level cleanup (Edge Function on timer) | pg_cron runs inside database with zero network latency, simpler than deploying/monitoring Edge Function |

**Installation:**
```bash
# React Email (only new dependency for this phase)
npm install react-email @react-email/components

# Already installed: resend, zod, @supabase/ssr, @supabase/supabase-js
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── actions/
│   │   └── verify-email.ts          # Server Action: verify token, update contact
│   ├── verify/
│   │   └── [token]/
│   │       └── page.tsx              # Confirmation page with button
├── emails/                           # NEW: React Email templates
│   ├── verification-email.tsx        # Branded verification email template
│   └── components/                   # Reusable email components (logo, footer)
├── lib/
│   ├── email/
│   │   └── send.ts                   # Resend client wrapper
│   └── tokens/
│       └── generate.ts               # Crypto token generation utility
supabase/
└── migrations/
    └── 00004_email_verification.sql  # Add verification columns to contacts table
```

### Pattern 1: Token Generation
**What:** Use Node.js `crypto.randomBytes()` for cryptographically secure tokens
**When to use:** Anytime generating verification tokens, password reset tokens, API keys
**Example:**
```typescript
// lib/tokens/generate.ts
// Source: Node.js crypto documentation + research findings
import { randomBytes } from 'crypto'

export function generateVerificationToken(): string {
  // 32 bytes = 256 bits of entropy, URL-safe base64 encoding
  return randomBytes(32).toString('base64url')
}
```
**Why this specific implementation:**
- `randomBytes()` uses OS-level CSPRNG (cryptographically secure pseudo-random number generator)
- 32 bytes provides 256 bits of entropy (more than sufficient for verification tokens)
- `base64url` encoding is URL-safe (no +, /, = characters that need encoding)
- Never use `Math.random()`, `uuid`, or key derivation functions for tokens

### Pattern 2: Two-Step Verification Page
**What:** Separate page with explicit button click to complete verification
**When to use:** Any email verification flow that must survive link prefetching
**Example:**
```typescript
// app/verify/[token]/page.tsx
// Source: Research on prefetching mitigation + Next.js 15 patterns
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params // Next.js 15: params is Promise

  // Validate token format only (don't consume token on page load!)
  const tokenSchema = z.string().min(40).max(50)
  const result = tokenSchema.safeParse(token)

  if (!result.success) {
    return <InvalidTokenError />
  }

  // Pass token to client form that calls Server Action on button click
  return <VerificationForm token={token} />
}
```
**Why two-step:**
- Corporate security scanners (Microsoft Safe Links, Barracuda) automatically visit links in emails
- Direct verification on page load would consume token before user clicks
- Explicit button click distinguishes real users from automated scanners
- Form submission to Server Action completes verification only when user confirms

### Pattern 3: Database Schema with Expiry
**What:** Store tokens with expiration timestamp in database
**When to use:** Email verification, password reset, any time-limited tokens
**Example:**
```sql
-- supabase/migrations/00004_email_verification.sql
-- Source: Research on token expiry best practices
ALTER TABLE public.contacts
ADD COLUMN verification_token TEXT UNIQUE,
ADD COLUMN verification_token_expires_at TIMESTAMPTZ,
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast token lookups during verification
CREATE INDEX idx_contacts_verification_token
ON public.contacts (verification_token)
WHERE verification_token IS NOT NULL;
```
**Why this schema:**
- `UNIQUE` constraint prevents token collisions
- `expires_at` timestamp enables expiry checks without separate cleanup immediately
- Partial index (WHERE NOT NULL) keeps index small, only active tokens indexed
- Store expiry in database (not just token generation time) for server-side enforcement

### Pattern 4: Token Cleanup with pg_cron
**What:** Scheduled database job to clean expired tokens
**When to use:** Any tokens with expiration that accumulate over time
**Example:**
```sql
-- Run via Supabase Dashboard: Database → Cron Jobs
-- Source: Supabase Cron documentation
SELECT cron.schedule(
  'cleanup-expired-verification-tokens',
  '0 2 * * *',  -- Daily at 2 AM
  $$
    UPDATE public.contacts
    SET
      verification_token = NULL,
      verification_token_expires_at = NULL
    WHERE
      verification_token IS NOT NULL
      AND verification_token_expires_at < NOW()
  $$
);
```
**Why pg_cron over alternatives:**
- Runs inside database with zero network latency
- No Edge Function deployment/monitoring overhead
- Supabase provides dashboard UI for cron management
- Reliable pg_cron extension (used by AWS RDS, Neon, etc.)

### Pattern 5: Branded Email with React Email
**What:** Type-safe React components for transactional emails
**When to use:** Any user-facing transactional email (verification, password reset, receipts)
**Example:**
```tsx
// emails/verification-email.tsx
// Source: React Email + Resend documentation
import { Html, Button, Text, Section } from '@react-email/components'

interface VerificationEmailProps {
  name: string
  verificationUrl: string
}

export default function VerificationEmail({
  name,
  verificationUrl
}: VerificationEmailProps) {
  return (
    <Html>
      <Section style={{ padding: '20px' }}>
        <Text>Hi {name},</Text>
        <Text>
          Click the button below to verify your email address and download your Book.
        </Text>
        <Button
          href={verificationUrl}
          style={{
            backgroundColor: '#7C3AED',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '999px'
          }}
        >
          Verify Email Address
        </Button>
        <Text style={{ color: '#666', fontSize: '12px' }}>
          This link expires in 24 hours.
        </Text>
      </Section>
    </Html>
  )
}
```
**Why React Email:**
- Type safety: TypeScript props validated at build time
- Component reuse: shared header/footer across all emails
- Local preview: `npm run email:dev` to preview emails in browser
- Renders to HTML compatible with all email clients (Outlook, Gmail, etc.)

### Pattern 6: Server Action for Verification
**What:** Server-side mutation to verify token and update contact record
**When to use:** Form submissions that mutate database state
**Example:**
```typescript
// app/actions/verify-email.ts
// Source: Next.js Server Actions + Supabase patterns
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function verifyEmailAction(formData: FormData) {
  const token = formData.get('token') as string

  const supabase = await createClient()

  // Use service role client to bypass RLS (verification is system operation)
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('id, email, name, verification_token_expires_at')
    .eq('verification_token', token)
    .single()

  if (error || !contact) {
    return { error: 'Invalid or expired verification link' }
  }

  // Check expiry
  if (new Date(contact.verification_token_expires_at) < new Date()) {
    return { error: 'Verification link has expired' }
  }

  // Mark as verified and clear token
  await supabase
    .from('contacts')
    .update({
      email_verified: true,
      verification_token: null,
      verification_token_expires_at: null,
    })
    .eq('id', contact.id)

  // Redirect to success page or Book download
  redirect('/verify/success')
}
```

### Anti-Patterns to Avoid

- **Verifying token on page load (GET request):** Causes prefetching to consume tokens. Always require explicit POST via form submission/button click.

- **Storing expiry time only in token:** Makes server-side expiry checks impossible. Always store `expires_at` timestamp in database.

- **Using short tokens (< 128 bits):** Vulnerable to brute force. Use at least 32 bytes (256 bits) from `crypto.randomBytes()`.

- **Reusing tokens after verification:** Security risk if token leaked. Always set to NULL after successful verification.

- **Sending raw HTML emails via SMTP:** Poor maintainability and no type safety. Use React Email for all transactional emails.

- **Not cleaning up expired tokens:** Database bloat over time. Schedule daily cleanup with pg_cron.

- **Using UUID for verification tokens:** UUIDs are identifiers, not cryptographic tokens. Use `crypto.randomBytes()` specifically designed for security.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token generation | Custom random string generator | Node.js `crypto.randomBytes()` | Cryptographic security is hard. Custom implementations often have bias/predictability. Use battle-tested OS-level CSPRNG |
| Email HTML rendering | String concatenation/template literals | React Email + @react-email/components | Email client compatibility (Outlook, Gmail) is complex. React Email handles table layouts, inline styles, fallbacks |
| Token expiry cleanup | Cron job on application server | Supabase pg_cron | Requires separate scheduler (node-cron, separate worker). pg_cron runs in database with zero setup |
| Email client configuration | Raw nodemailer/SMTP setup | Resend SDK | SMTP auth, retry logic, rate limiting, deliverability monitoring. Resend handles all of this |
| Link prefetch protection | Custom bot detection | Two-step confirmation page | Bot detection arms race. User-Agent sniffing is unreliable. Explicit button click is simple and reliable |

**Key insight:** Email verification has many subtle security pitfalls (token predictability, timing attacks, prefetching). Use proven libraries and patterns rather than custom implementations.

## Common Pitfalls

### Pitfall 1: Token Consumed by Email Prefetching
**What goes wrong:** Verification link clicked by email client/security scanner before user sees it. Token marked as used, user sees "invalid token" error.
**Why it happens:** Corporate email security (Microsoft Safe Links, Barracuda, Gmail link scanning) automatically visits all links in emails to check for malware/phishing.
**How to avoid:** Never verify on GET request. Always require explicit POST via button click on confirmation page. Page load only validates token format, button click completes verification.
**Warning signs:** Users report "link already used" immediately after receiving email (seconds, not hours). Higher error rate from corporate email domains (@microsoft.com, @google.com employees using company email security).

**Sources:**
- [Supabase OTP verification failures documentation](https://supabase.com/docs/guides/troubleshooting/otp-verification-failures-token-has-expired-or-otp_expired-errors-5ee4d0)
- [Medium article on prefetching breaking magic links](https://obie.medium.com/prefetching-breaks-magic-link-password-less-login-systems-unless-you-take-precautions-a4c011a3e165)
- [Hacker News discussion on Gmail caching URLs](https://news.ycombinator.com/item?id=28240279)

### Pitfall 2: Weak Token Entropy
**What goes wrong:** Tokens are predictable or brute-forceable, allowing attackers to guess valid tokens.
**Why it happens:** Using `Math.random()`, timestamp-based generation, or short tokens (< 128 bits).
**How to avoid:** Always use `crypto.randomBytes(32)` which provides 256 bits of cryptographically secure entropy. Never use `Math.random()`, UUID, or custom random implementations.
**Warning signs:** Security audit flags token generation. Token collision (two users get same token). Successful brute force attacks in logs.

**Sources:**
- [Node.js crypto.randomBytes() documentation](https://nodejs.org/api/crypto.html)
- [Secure random values in Node.js GitHub gist](https://gist.github.com/joepie91/7105003c3b26e65efcea63f3db82dfba?permalink_comment_id=3595666)

### Pitfall 3: Token Expiry Not Enforced Server-Side
**What goes wrong:** Expired tokens still work because expiry check happens client-side or not at all.
**Why it happens:** Only storing token generation time in logs/client, not database. Trusting client-side time checks.
**How to avoid:** Store `verification_token_expires_at` timestamp in database. Check `expires_at < NOW()` on server before completing verification. Never trust client-provided timestamps.
**Warning signs:** Old verification links still work days/weeks later. No cleanup of expired tokens in database.

**Sources:**
- [Email verification flows with Spring Boot (pattern applies to Node.js)](https://medium.com/@AlexanderObregon/email-verification-flows-with-spring-boot-and-expiring-tokens-e9b2a238d917)
- [Token expiry best practices from Zuplo](https://zuplo.com/blog/2025/03/01/token-expiry-best-practices)

### Pitfall 4: Token Reuse After Verification
**What goes wrong:** Token remains valid after successful verification, allowing replay attacks or multiple downloads.
**Why it happens:** Forgetting to set `verification_token = NULL` after successful verification.
**How to avoid:** Always update database after verification: set `email_verified = TRUE`, `verification_token = NULL`, `verification_token_expires_at = NULL`. Token is single-use only.
**Warning signs:** User can verify email multiple times with same link. Leaked token allows access even after "verification complete" message shown.

### Pitfall 5: Email Client Compatibility Broken
**What goes wrong:** Verification emails look broken in Outlook, buttons don't work on mobile, images don't load.
**Why it happens:** Writing raw HTML without understanding email client limitations (no CSS support in many clients, must use table layouts).
**How to avoid:** Use React Email which handles rendering to email-compatible HTML. Test emails in https://www.emailonacid.com/ or similar (sends to real clients). Never use CSS Grid, Flexbox, external stylesheets in emails.
**Warning signs:** User complaints about formatting. Buttons not clickable on mobile. Emails render as plain text.

**Sources:**
- [React Email GitHub repository](https://github.com/resend/react-email)
- [Resend email templates documentation](https://resend.com/docs/dashboard/emails/email-templates)

### Pitfall 6: Database Token Index Missing
**What goes wrong:** Token verification queries are slow (100ms+) causing poor UX and server timeouts.
**Why it happens:** No index on `verification_token` column, causing full table scan on every verification.
**How to avoid:** Create index on `verification_token` column. Use partial index `WHERE verification_token IS NOT NULL` to keep index small (most contacts won't have active tokens).
**Warning signs:** Slow verification API responses. Database CPU spikes during verification requests. Query logs show sequential scans on contacts table.

### Pitfall 7: Not Handling "Verify Again" Requests
**What goes wrong:** User's first verification email expires, they can't request a new one, support ticket required.
**Why it happens:** No UX flow for regenerating verification token after expiry.
**How to avoid:** On expired token error, show "Request new verification email" link that regenerates token and resends email. Reuse existing `verification_token` if not expired (don't spam user with multiple emails).
**Warning signs:** Support tickets asking for new verification links. Users creating new accounts because they can't verify original email.

## Code Examples

Verified patterns from official sources:

### Token Generation
```typescript
// lib/tokens/generate.ts
// Source: Node.js crypto documentation
import { randomBytes } from 'crypto'

export function generateVerificationToken(): string {
  // 32 bytes = 64 hex characters = 256 bits of entropy
  // base64url encoding creates URL-safe string without +, /, =
  return randomBytes(32).toString('base64url')
}

// For testing: validate token format
export function isValidTokenFormat(token: string): boolean {
  // base64url tokens are 43 characters (32 bytes -> 256 bits -> base64url)
  return /^[A-Za-z0-9_-]{43}$/.test(token)
}
```

### React Email Template
```tsx
// emails/verification-email.tsx
// Source: React Email documentation
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr
} from '@react-email/components'

interface VerificationEmailProps {
  name: string
  verificationUrl: string
}

const VerificationEmail = ({
  name,
  verificationUrl
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
      <Container style={{
        backgroundColor: '#ffffff',
        margin: '40px auto',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <Section>
          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
            Hi {name},
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
            Thanks for signing up! Click the button below to verify your email
            address and download your Book.
          </Text>
          <Button
            href={verificationUrl}
            style={{
              backgroundColor: '#7C3AED',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '9999px',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: '600'
            }}
          >
            Verify Email Address
          </Button>
          <Text style={{ fontSize: '14px', color: '#666666', marginTop: '20px' }}>
            This link will expire in 24 hours.
          </Text>
          <Hr style={{ borderColor: '#e6e6e6', marginTop: '20px' }} />
          <Text style={{ fontSize: '12px', color: '#999999' }}>
            If you didn't request this email, you can safely ignore it.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail
```

### Sending Email with Resend
```typescript
// lib/email/send-verification.ts
// Source: Resend + React Email integration docs
import { Resend } from 'resend'
import VerificationEmail from '@/emails/verification-email'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendVerificationEmail({
  to,
  name,
  token,
}: {
  to: string
  name: string
  token: string
}) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${token}`

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: 'Verify your email address',
    react: VerificationEmail({ name, verificationUrl }),
  })

  if (error) {
    console.error('Failed to send verification email:', error)
    throw new Error('Failed to send email')
  }

  return data
}
```

### Database Migration
```sql
-- supabase/migrations/00004_email_verification.sql
-- Add verification columns to contacts table
ALTER TABLE public.contacts
ADD COLUMN verification_token TEXT,
ADD COLUMN verification_token_expires_at TIMESTAMPTZ;

-- Add unique constraint to prevent token collisions
ALTER TABLE public.contacts
ADD CONSTRAINT contacts_verification_token_unique
UNIQUE (verification_token);

-- Partial index for fast token lookups (only indexes non-null tokens)
CREATE INDEX idx_contacts_verification_token
ON public.contacts (verification_token)
WHERE verification_token IS NOT NULL;

-- email_verified column already exists from Phase 5 migration
-- but set explicit default if not set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.contacts
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;
```

### Verification Page (Two-Step Flow)
```tsx
// app/verify/[token]/page.tsx
// Source: Next.js 15 dynamic routes + research on prefetch protection
import { z } from 'zod'
import VerificationForm from './verification-form'

// Token format validation schema
const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/, {
  message: 'Invalid token format',
})

interface VerifyPageProps {
  params: Promise<{ token: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  // Next.js 15: params is Promise, must await
  const { token } = await params

  // Validate token FORMAT only (don't consume token!)
  const result = tokenSchema.safeParse(token)

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Link</h1>
          <p className="mt-2 text-gray-600">
            This verification link is not valid.
          </p>
        </div>
      </div>
    )
  }

  // Pass token to client component that submits form
  return <VerificationForm token={token} />
}
```

### Verification Form (Client Component)
```tsx
// app/verify/[token]/verification-form.tsx
'use client'

import { useActionState } from 'react'
import { verifyEmailAction } from '@/app/actions/verify-email'

interface VerificationFormProps {
  token: string
}

export default function VerificationForm({ token }: VerificationFormProps) {
  const [state, formAction, isPending] = useActionState(verifyEmailAction, null)

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
          <p className="mt-2 text-gray-600">
            Your email has been verified. You can now download your Book.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form action={formAction} className="max-w-md text-center">
        <input type="hidden" name="token" value={token} />

        <h1 className="text-2xl font-bold">Confirm Your Email</h1>
        <p className="mt-2 text-gray-600">
          Click the button below to verify your email address.
        </p>

        {state?.error && (
          <p className="mt-4 text-red-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 px-6 py-3 bg-accent text-white rounded-full font-bold hover:bg-accent/90 disabled:opacity-50"
        >
          {isPending ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  )
}
```

### Server Action for Verification
```typescript
// app/actions/verify-email.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const verifySchema = z.object({
  token: z.string().min(40),
})

export async function verifyEmailAction(prevState: any, formData: FormData) {
  // Validate input
  const result = verifySchema.safeParse({
    token: formData.get('token'),
  })

  if (!result.success) {
    return { error: 'Invalid token' }
  }

  const { token } = result.data

  try {
    const supabase = await createClient()

    // Look up contact by token
    const { data: contact, error: lookupError } = await supabase
      .from('contacts')
      .select('id, email, name, email_verified, verification_token_expires_at')
      .eq('verification_token', token)
      .single()

    if (lookupError || !contact) {
      return {
        error: 'Invalid or expired verification link. Please request a new one.'
      }
    }

    // Already verified
    if (contact.email_verified) {
      return { success: true, alreadyVerified: true }
    }

    // Check expiry
    if (new Date(contact.verification_token_expires_at) < new Date()) {
      return {
        error: 'This verification link has expired. Please request a new one.'
      }
    }

    // Mark as verified and clear token
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq('id', contact.id)

    if (updateError) {
      console.error('Failed to update contact:', updateError)
      return { error: 'Verification failed. Please try again.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Verification error:', err)
    return { error: 'Verification failed. Please try again.' }
  }
}
```

### Token Cleanup Cron Job
```sql
-- Run via Supabase Dashboard: Database → Cron Jobs
-- Or via SQL Editor
SELECT cron.schedule(
  'cleanup-expired-verification-tokens',
  '0 2 * * *',  -- Daily at 2:00 AM
  $$
    UPDATE public.contacts
    SET
      verification_token = NULL,
      verification_token_expires_at = NULL
    WHERE
      verification_token IS NOT NULL
      AND verification_token_expires_at < NOW()
  $$
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| String template emails | React Email components | 2023-2024 | Type-safe email templates, component reuse, better DX |
| Direct verification links | Two-step confirmation pages | 2019-2021 | Survives email prefetching by corporate security scanners |
| Application-level cron (node-cron) | Database-level pg_cron | 2021-2023 | Zero infrastructure for scheduled jobs, runs in database |
| Supabase Auth email verification | Custom verification tokens | Context-dependent | Supabase Auth requires full user accounts. Custom tokens lighter weight for simple email verification |
| Go templates (Supabase default) | React Email | 2023-2024 | Better DX, type safety, local preview, component reuse |

**Deprecated/outdated:**
- **Direct verification on GET request:** Vulnerable to email prefetching. Always use POST via form submission.
- **UUID for security tokens:** UUIDs are identifiers, not cryptographic tokens. Use `crypto.randomBytes()`.
- **Inline HTML email strings:** Unmaintainable and error-prone. Use React Email for all transactional emails.
- **Math.random() for token generation:** Not cryptographically secure. Use `crypto.randomBytes()`.

## Open Questions

1. **Token expiry duration**
   - What we know: Industry standard is 24 hours for email verification (balances UX and security)
   - What's unclear: Whether shorter expiry (1-2 hours) would be better for Book downloads (lower risk than password reset)
   - Recommendation: Start with 24 hours (user-friendly), collect metrics, adjust if abuse detected

2. **Re-request flow**
   - What we know: Users will lose/expire verification emails and need new ones
   - What's unclear: Should re-request be automatic (button on expired token page) or require support contact?
   - Recommendation: Automatic re-request with rate limiting (max 3 emails per 24h per email address)

3. **Email deliverability monitoring**
   - What we know: Resend provides webhook events for bounces, complaints, opens
   - What's unclear: Whether to implement webhook handling in Phase 7 or defer to future phase
   - Recommendation: Defer to future phase unless verification emails show delivery issues during testing

4. **Token storage security**
   - What we know: Tokens are cryptographically random and stored in database
   - What's unclear: Whether to hash tokens before database storage (like passwords) vs store plaintext
   - Recommendation: Store plaintext for now (tokens are single-use, time-limited, random). Hashing adds complexity without significant security gain for this use case

## Sources

### Primary (HIGH confidence)
- [Supabase Send Email Hook documentation](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook) - Hook parameters, token handling
- [Supabase Email Templates documentation](https://supabase.com/docs/guides/auth/auth-email-templates) - Template variables, Go template syntax
- [Supabase Cron documentation](https://supabase.com/docs/guides/cron) - pg_cron setup and usage
- [Resend email templates documentation](https://resend.com/docs/dashboard/emails/email-templates) - Template creation, variable system
- [Node.js crypto documentation](https://nodejs.org/api/crypto.html) - randomBytes() CSPRNG
- [Next.js dynamic routes documentation](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - Next.js 15 params Promise
- [React Email GitHub repository](https://github.com/resend/react-email) - Component API, examples

### Secondary (MEDIUM confidence)
- [Supabase OTP verification failures troubleshooting](https://supabase.com/docs/guides/troubleshooting/otp-verification-failures-token-has-expired-or-otp_expired-errors-5ee4d0) - Prefetching issues
- [Medium article: Prefetching breaks magic links](https://obie.medium.com/prefetching-breaks-magic-link-password-less-login-systems-unless-you-take-precautions-a4c011a3e165) - Two-step solution
- [Hacker News: Gmail caching URLs](https://news.ycombinator.com/item?id=28240279) - Corporate scanner behavior
- [Medium article: Email verification flows with Spring Boot](https://medium.com/@AlexanderObregon/email-verification-flows-with-spring-boot-and-expiring-tokens-e9b2a238d917) - Token expiry patterns
- [GitHub gist: Secure random values in Node.js](https://gist.github.com/joepie91/7105003c3b26e65efcea63f3db82dfba?permalink_comment_id=3595666) - randomBytes() usage
- [Next.js 15 dynamic routes guide (TheLinuxCode)](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/) - 2026-specific Next.js patterns

### Tertiary (LOW confidence)
- [SuperTokens blog: Email verification flow](https://supertokens.com/blog/implementing-the-right-email-verification-flow) - General patterns (not Supabase-specific)
- [Zuplo: Token expiry best practices](https://zuplo.com/blog/2025/03/01/token-expiry-best-practices) - General token patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use (Phase 5/6) except React Email (official Resend integration)
- Architecture: HIGH - Patterns verified with official Next.js, Supabase, and Resend documentation
- Pitfalls: HIGH - Prefetching issue well-documented in Supabase docs and community discussions

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days - stable ecosystem)
