# Phase 8: Book PDF Downloads - Research

**Researched:** 2026-02-16
**Domain:** PDF file serving with authentication and analytics
**Confidence:** HIGH

## Summary

Phase 8 enables verified users to download Book PDFs securely after completing email verification. The implementation requires three components: (1) a Next.js Route Handler to serve PDFs with authentication checks, (2) download tracking in the database for analytics, and (3) placeholder PDF files stored outside /public/ to prevent direct access.

The standard approach uses Next.js 15 Route Handlers with dynamic segments (`/api/download/[book_type]/route.ts`) to check email verification status via database lookup, log the download to a new `book_downloads` table, and stream the PDF file with proper Content-Disposition headers. Files must be stored outside /public/ (e.g., `/private/books/`) since Next.js serves /public/ files directly without authentication checks.

**Primary recommendation:** Use Next.js Route Handler to authenticate via email lookup, stream files from private directory with fs/promises, log downloads to dedicated analytics table, and link from verification success page.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Route Handlers | 15.x | Authenticated file serving | Built-in App Router feature, uses Web APIs (Request/Response), supports streaming |
| Node.js fs/promises | Built-in | File reading and streaming | Standard library for file operations, native ReadableStream support in Node 18+ |
| Supabase PostgreSQL | Current | Download analytics storage | Already in stack (Phase 5), RLS for access control |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Next.js middleware | 15.x | Pre-request auth checks | Optional - useful if adding rate limiting or broad auth gates, but not required for Phase 8 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Route Handler file serving | Supabase Storage | Supabase Storage provides S3-compatible storage with RLS policies and signed URLs, but adds complexity (file uploads, bucket config) when placeholder PDFs are temporary and will be replaced in future phases. Route Handler is simpler for static placeholder files. |
| Private directory | Supabase Storage private bucket | Same as above - Route Handler + private dir is simpler for placeholder PDFs. Use Supabase Storage when PDFs become dynamic/user-uploaded. |
| Database lookup for auth | Session-based auth | No user sessions exist in v2.0 (notification signup only, per REQUIREMENTS.md). Email verification status is the auth mechanism. |

**Installation:**
No new packages required - uses built-in Next.js Route Handlers and Node.js fs/promises.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── download/
│           └── [book_type]/
│               └── route.ts        # GET handler for authenticated downloads
├── lib/
│   └── analytics/
│       └── log-download.ts         # Helper function to insert download records
private/
└── books/
    ├── publishers.pdf              # Placeholder PDF files
    ├── agents.pdf
    └── therapists.pdf
```

Note: `/private/` is at project root (same level as /src/ and /public/), NOT inside /public/. Next.js only serves files from /public/ directory directly.

### Pattern 1: Authenticated Route Handler with Database Lookup

**What:** Route Handler checks email verification status before serving file.

**When to use:** File access requires authentication but no user sessions exist (email-based verification).

**Example:**
```typescript
// src/app/api/download/[book_type]/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ book_type: string }> }
) {
  const { book_type } = await params

  // 1. Validate book_type parameter
  if (!['publishers', 'agents', 'therapists'].includes(book_type)) {
    return new Response('Invalid book type', { status: 400 })
  }

  // 2. Get email from query parameter (passed from verification success page)
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return new Response('Missing email parameter', { status: 400 })
  }

  // 3. Check verification status in database
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('id, email_verified')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error || !data || !data.email_verified) {
    return new Response('Unauthorized - email not verified', { status: 403 })
  }

  // 4. Log download to analytics table
  await supabase.from('book_downloads').insert({
    contact_id: data.id,
    book_type,
    downloaded_at: new Date().toISOString(),
  })

  // 5. Serve PDF file with proper headers
  const filePath = path.join(process.cwd(), 'private', 'books', `${book_type}.pdf`)
  const fileBuffer = await fs.readFile(filePath)

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${book_type}-book.pdf"`,
      'Content-Length': fileBuffer.length.toString(),
    },
  })
}
```
Source: Synthesized from [Next.js Route Handlers docs](https://nextjs.org/docs/app/api-reference/file-conventions/route) and [Eric Burel's file streaming guide](https://www.ericburel.tech/blog/nextjs-stream-files)

### Pattern 2: Streaming Large Files (Alternative)

**What:** Stream files instead of loading entire buffer into memory.

**When to use:** File sizes > 10MB or need to optimize memory usage.

**Example:**
```typescript
// For large files, stream instead of buffering
const fileHandle = await fs.open(filePath)
const stream = fileHandle.readableWebStream({ type: 'bytes' })

return new Response(stream, {
  status: 200,
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${book_type}-book.pdf"`,
  },
})
```
Source: [Eric Burel - Streaming files from Next.js Route Handlers](https://www.ericburel.tech/blog/nextjs-stream-files)

Note: For Phase 8 placeholder PDFs (likely < 1MB), buffering is simpler. Use streaming if PDFs exceed 5-10MB.

### Pattern 3: Download Analytics Table Schema

**What:** Dedicated table for tracking file downloads.

**When to use:** Need to analyze download patterns, count downloads per book type, track timestamps.

**Example:**
```sql
-- supabase/migrations/00006_create_book_downloads_table.sql
CREATE TABLE public.book_downloads (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  book_type TEXT NOT NULL CHECK (book_type IN ('publishers', 'agents', 'therapists')),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analytics queries (downloads by contact, by book type, by date range)
CREATE INDEX idx_book_downloads_contact_id ON public.book_downloads (contact_id);
CREATE INDEX idx_book_downloads_book_type ON public.book_downloads (book_type);
CREATE INDEX idx_book_downloads_downloaded_at ON public.book_downloads (downloaded_at);

-- Enable RLS
ALTER TABLE public.book_downloads ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed for v2.0 (service role only writes via Route Handler)
-- Future: Add SELECT policies if authenticated users need to see their download history
```
Source: Synthesized from [existing contacts/book_requests schema](supabase/migrations/00001_create_contacts_and_book_requests.sql) and [database design best practices](https://medium.com/@abdelaz9z/best-practices-for-database-design-incorporating-timestamps-and-user-metadata-in-tables-2310527dd677)

### Pattern 4: Verification Success Page Link

**What:** After verification succeeds, show download link that redirects to authenticated Route Handler.

**When to use:** User needs explicit action to trigger download (better UX than auto-download).

**Example:**
```typescript
// src/app/verify/[token]/verification-form.tsx - success state
if (state?.success) {
  return (
    <div className="max-w-md w-full rounded-2xl bg-white/95 backdrop-blur shadow-lg p-8">
      <div className="text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h1>
        <p className="text-gray-600 mb-6">
          Your email has been verified successfully. Click the button below to download your Book.
        </p>
        <a
          href={`/api/download/${bookType}?email=${encodeURIComponent(email)}`}
          className="inline-block rounded-full bg-accent text-white font-bold py-3 px-8 hover:bg-accent/90 transition-colors"
        >
          Download Book PDF
        </a>
      </div>
    </div>
  )
}
```

Note: `bookType` and `email` must be passed from the verification action state or stored in the form component after successful verification.

### Anti-Patterns to Avoid

- **Storing PDFs in /public/ directory:** Files in /public/ are directly accessible without authentication. Anyone can construct `/public/books/publishers.pdf` URL and bypass verification. Always store protected files outside /public/.

- **Using Supabase service_role key on client:** Never expose service_role key to client for download auth. Route Handler authenticates server-side and uses anon/server client for database lookups.

- **Auto-downloading on verification:** Auto-triggering downloads immediately after verification creates poor UX (browser popup blockers, unclear action). Show explicit "Download" button instead.

- **Not logging downloads:** Analytics requirement (Success Criteria #3) requires tracking download requests. Always insert to `book_downloads` table before serving file.

- **Email-only authentication without database check:** Don't trust email query parameter alone - always verify `email_verified=true` in database before serving file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File storage with CDN | Custom S3/CloudFront setup | Supabase Storage (future phases) | Supabase Storage provides S3-compatible API, RLS policies, signed URLs, and CDN integration out of the box. Avoid reinventing when ready to move beyond placeholder PDFs. |
| Rate limiting | Custom request counting | Vercel rate limiting or Upstash Redis | Production apps need rate limiting for download endpoints. Use platform-native solutions (Vercel Pro plan) or battle-tested Redis patterns (Upstash with Vercel integration) rather than building counters. |
| Token-based download URLs | JWT or custom tokens | Supabase Storage signed URLs (future) | When PDFs become dynamic, Supabase Storage's built-in signed URL feature (`createSignedUrl()`) provides time-limited, secure download URLs without hand-rolling token systems. |

**Key insight:** Phase 8 uses simple patterns (Route Handler + email lookup) suitable for placeholder PDFs. Future phases should migrate to Supabase Storage when PDFs become dynamic, user-uploaded, or require CDN distribution. Don't over-engineer now, but plan the migration path.

## Common Pitfalls

### Pitfall 1: Middleware Cannot Protect Static Files in /public/

**What goes wrong:** Attempting to use Next.js middleware to authenticate requests for files in /public/ directory fails silently - middleware never runs for static assets.

**Why it happens:** Next.js serves /public/ files directly at build time and bypasses middleware entirely. The [Next.js middleware docs](https://nextjs.org/docs/app/building-your-application/routing/middleware) explicitly state: "Middleware does not run on... public files (`/public/...`)"

**How to avoid:** Store protected files OUTSIDE /public/. Use a `/private/` directory at project root or store files in a database/object storage system. Serve through Route Handlers with authentication checks.

**Warning signs:** Files downloading without authentication, middleware console.log statements never appearing for certain requests.

Source: [Next.js middleware limitations](https://nextjs.org/docs/app/building-your-application/routing/middleware) and [GitHub discussion on protecting static files](https://github.com/vercel/next.js/discussions/72515)

### Pitfall 2: Large File Buffering Causes Memory Issues

**What goes wrong:** Using `fs.readFile()` to load entire PDF into memory buffer causes Node.js heap errors or slowness when multiple users download simultaneously.

**Why it happens:** `readFile()` loads entire file into RAM before serving. With multiple concurrent requests for 10MB+ PDFs, memory usage spikes and causes OOM errors.

**How to avoid:** Use streaming for files > 5MB. Node.js 18+ provides `fileHandle.readableWebStream({ type: 'bytes' })` for one-liner streaming to Next.js Response object.

**Warning signs:** "JavaScript heap out of memory" errors, slow download initiation, server unresponsiveness during concurrent downloads.

Source: [Eric Burel - Streaming files from Next.js Route Handlers](https://www.ericburel.tech/blog/nextjs-stream-files)

Note: Phase 8 placeholder PDFs are likely < 1MB, so buffering is acceptable. Document file sizes and revisit if PDFs exceed 5MB.

### Pitfall 3: Missing RLS Policies Block Database Operations

**What goes wrong:** Route Handler using anon client cannot read contacts table if RLS SELECT policy is too restrictive. Query returns empty results even for verified emails.

**Why it happens:** Existing RLS SELECT policy on contacts (`verification_token IS NOT NULL`) only allows reads when token exists. After verification, token is cleared, so anon client cannot read the row.

**How to avoid:** Route Handler must use service_role client (via `createClient()` from server context) to bypass RLS when checking verification status. Alternatively, add a new RLS policy allowing SELECT when email_verified=true, but service_role is simpler for server-side auth checks.

**Warning signs:** Database queries in Route Handler return empty results despite records existing, console logs showing "Unauthorized" responses for verified users.

Source: Existing codebase patterns in [contacts table RLS policies](supabase/migrations/00001_create_contacts_and_book_requests.sql) and Phase 7 verification implementation.

### Pitfall 4: Email Parameter Spoofing Without Database Validation

**What goes wrong:** Attacker passes `?email=victim@example.com` in download URL and receives file even if they didn't verify that email.

**Why it happens:** Trusting query parameters without server-side validation. Download endpoint must verify email ownership (via token, session, or another mechanism).

**How to avoid:** For Phase 8, since no user sessions exist, pass email as a URL parameter but ALWAYS validate email_verified=true in database before serving file. Consider adding a short-lived signed token (generated after verification, valid for 5 minutes) for stronger auth in future phases.

**Warning signs:** Download links shareable between users, unauthorized access to PDFs, security audit findings.

Source: [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication) and general web security best practices.

Note: Phase 8 uses email query parameter because no sessions exist. This is acceptable for pre-launch (low stakes, placeholder PDFs) but should be upgraded to token-based auth in production (Phase 9+ or v2.1).

### Pitfall 5: Route Handler Caching Breaks Dynamic Authentication

**What goes wrong:** Next.js caches Route Handler responses, causing authenticated downloads to serve stale data or fail authentication checks.

**Why it happens:** Next.js 15 defaults GET Route Handlers to dynamic (uncached), but certain configurations or patterns can trigger static rendering. If cached, authentication logic runs once at build time, not per request.

**How to avoid:** Add `export const dynamic = 'force-dynamic'` to Route Handler file to guarantee runtime evaluation. Verify build output shows route as `(Dynamic)` not `(Static)`.

**Warning signs:** First download works, subsequent downloads fail or succeed without database check, console logs only appear once during build.

Source: [Next.js Route Handler docs - Caching](https://nextjs.org/docs/app/api-reference/file-conventions/route#segment-config-options) and [Next.js 15 caching changes](https://nextjs.org/blog/next-15)

## Code Examples

Verified patterns from official sources:

### Authenticated File Download Route Handler

```typescript
// src/app/api/download/[book_type]/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs/promises'
import path from 'path'

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ book_type: string }> }
) {
  const { book_type } = await params

  // 1. Validate book_type
  const validBookTypes = ['publishers', 'agents', 'therapists']
  if (!validBookTypes.includes(book_type)) {
    return new Response('Invalid book type', { status: 400 })
  }

  // 2. Extract email from query parameter
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return new Response('Missing email parameter', { status: 400 })
  }

  try {
    // 3. Check verification status (uses service_role to bypass RLS)
    const supabase = await createClient()
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('id, email_verified')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !contact || !contact.email_verified) {
      return new Response('Unauthorized - email not verified', { status: 403 })
    }

    // 4. Log download to analytics table
    const { error: logError } = await supabase
      .from('book_downloads')
      .insert({
        contact_id: contact.id,
        book_type,
        downloaded_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Failed to log download:', logError)
      // Continue with download even if logging fails
    }

    // 5. Read and serve PDF file
    const filePath = path.join(process.cwd(), 'private', 'books', `${book_type}.pdf`)
    const fileBuffer = await fs.readFile(filePath)

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="continua-${book_type}-book.pdf"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('Download error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
```
Source: Synthesized from [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), existing Supabase patterns in codebase, and [file serving examples](https://www.ericburel.tech/blog/nextjs-stream-files)

### Download Analytics Helper Function

```typescript
// src/lib/analytics/log-download.ts
import { createClient } from '@/lib/supabase/server'

export async function logDownload(contactId: number, bookType: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('book_downloads')
    .insert({
      contact_id: contactId,
      book_type: bookType,
      downloaded_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Failed to log download:', error)
    // Don't throw - logging failure shouldn't block download
  }
}
```

### Verification Success with Download Link

```typescript
// src/app/verify/[token]/verification-form.tsx - modify success state
'use client'

import { useActionState, useState } from 'react'
import { verifyEmailAction } from '@/app/actions/verify-email'

interface VerificationFormProps {
  token: string
}

export default function VerificationForm({ token }: VerificationFormProps) {
  const [state, formAction, isPending] = useActionState(verifyEmailAction, null)
  const [email, setEmail] = useState<string>('')
  const [bookType, setBookType] = useState<string>('')

  // Extract email and book_type from verification success response
  // (requires modifying verifyEmailAction to return email + book_type in success state)

  if (state?.success && state.email && state.bookType) {
    return (
      <div className="max-w-md w-full rounded-2xl bg-white/95 backdrop-blur shadow-lg p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h1>
          <p className="text-gray-600 mb-6">
            Your email has been verified successfully. Click the button below to download your Book.
          </p>
          <a
            href={`/api/download/${state.bookType}?email=${encodeURIComponent(state.email)}`}
            className="inline-block rounded-full bg-accent text-white font-bold py-3 px-8 hover:bg-accent/90 transition-colors"
            download
          >
            Download {state.bookType.charAt(0).toUpperCase() + state.bookType.slice(1)} Book PDF
          </a>
        </div>
      </div>
    )
  }

  // ... rest of form (default/error states)
}
```

Note: This requires modifying `verifyEmailAction` to query `book_requests` table and return the book_type alongside the success response.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Middleware for auth | Route Handler auth checks | Next.js 13+ App Router | Middleware cannot protect /public/ files, Route Handlers provide request-level auth with full Request/Response control |
| Node.js streams API | Web Streams API (`ReadableStream`) | Next.js 13+ / Node 18+ | Route Handlers use Web APIs (fetch standard), making code more portable and compatible with edge runtimes |
| API Routes (Pages Router) | Route Handlers (App Router) | Next.js 13+ | Route Handlers colocated with app structure, use Web APIs, support React Server Components patterns |
| Custom S3 integration | Supabase Storage | Supabase Storage launch (2021) | Supabase Storage provides S3-compatible storage with RLS policies, signed URLs, and Postgres integration - eliminates need for custom S3 auth flows |

**Deprecated/outdated:**
- **API Routes (`pages/api/`)**: Still supported but deprecated in favor of App Router Route Handlers (`app/api/*/route.ts`). New projects should use Route Handlers for consistency with App Router patterns.
- **bodyParser config in API Routes**: Route Handlers use standard Web APIs (`request.json()`, `request.formData()`) instead of custom bodyParser middleware. No config needed.

Source: [Next.js 15 Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) and [Supabase Storage docs](https://supabase.com/docs/guides/storage)

## Open Questions

1. **Placeholder PDF file sizes**
   - What we know: Phase 8 uses placeholder PDFs stored in /private/books/
   - What's unclear: Actual file sizes, whether buffering or streaming is needed
   - Recommendation: Start with buffering (`fs.readFile()`). If placeholder PDFs exceed 5MB, switch to streaming (`fileHandle.readableWebStream()`) in a follow-up iteration. Document file sizes in migration plan.

2. **Email parameter in download URL - security tradeoff**
   - What we know: No user sessions exist in v2.0, email is the only identifier
   - What's unclear: Whether passing email in URL is acceptable security posture for pre-launch
   - Recommendation: Use email query parameter for Phase 8 (acceptable for pre-launch with placeholder PDFs). Plan upgrade to signed tokens in v2.1 when adding user accounts. Document security limitation in code comments.

3. **Book type persistence after verification**
   - What we know: User verifies email via link from Book dialog, but verification page doesn't know which book type was requested
   - What's unclear: Should verification action query book_requests table to determine book type, or should book type be embedded in verification token/URL?
   - Recommendation: Query book_requests table in verification success handler (join contacts → book_requests). Return book_type in success state to display correct download link. This keeps token format simple and avoids encoding data in URLs.

4. **Download button placement**
   - What we know: Success criteria states "User with verified email can download requested Book PDF"
   - What's unclear: Should download link appear only on verification success page, or also in Book dialogs if user is already verified?
   - Recommendation: For Phase 8, show download link only on verification success page (simpler implementation). In Phase 9 or later, enhance Book dialogs to detect if user is already verified and show direct download link. This progressive enhancement matches v2.0 scope.

## Sources

### Primary (HIGH confidence)
- [Next.js Route Handlers Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/route) - Official Next.js 16.1.6 docs, last updated 2026-02-11
- [Next.js Middleware Limitations](https://nextjs.org/docs/app/building-your-application/routing/middleware) - Official docs on middleware scope
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage) - Official storage guide
- [Supabase Storage Downloads](https://supabase.com/docs/guides/storage/serving/downloads) - Download methods and authentication patterns
- [Eric Burel - Streaming Files from Next.js Route Handlers](https://www.ericburel.tech/blog/nextjs-stream-files) - Production patterns for file serving
- Existing codebase: migrations 00001-00005, verification flow implementation in Phase 7

### Secondary (MEDIUM confidence)
- [Next.js Security Best Practices (2026)](https://medium.com/@widyanandaadi22/next-js-security-hardening-five-steps-to-bulletproof-your-app-in-2026-61e00d4c006e) - Security hardening guide
- [Next.js Route Protection Patterns](https://bitskingdom.com/blog/nextjs-authentication-protected-routes/) - Authentication patterns in App Router
- [Database Design Best Practices - Timestamps](https://medium.com/@abdelaz9z/best-practices-for-database-design-incorporating-timestamps-and-user-metadata-in-tables-2310527dd677) - Schema design for analytics tables
- [GitHub Discussion - Protecting Static Files](https://github.com/vercel/next.js/discussions/72515) - Community discussion on /public/ limitations

### Tertiary (LOW confidence)
- [File Download Tracking Patterns](https://plausible.io/blog/track-file-downloads-in-web-analytics) - General analytics patterns (not Next.js specific)
- [Matomo Database Schema](https://developer.matomo.org/guides/database-schema) - Analytics schema examples (different platform)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js Route Handlers and fs/promises are official APIs with stable documentation
- Architecture: HIGH - Patterns synthesized from official docs and verified against existing codebase (Phase 7 verification flow)
- Pitfalls: HIGH - Middleware limitations documented in official Next.js docs, RLS pitfall observed in existing codebase patterns
- Open questions: MEDIUM - Recommendations based on v2.0 requirements and scope, but some decisions (download button placement, security tradeoffs) should be validated with user during planning

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days - stable Next.js patterns)
