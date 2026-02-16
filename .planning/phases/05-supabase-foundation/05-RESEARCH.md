# Phase 5: Supabase Foundation - Research

**Researched:** 2026-02-15
**Domain:** Backend infrastructure (Supabase, PostgreSQL, email delivery, authentication)
**Confidence:** HIGH

## Summary

Phase 5 establishes the backend foundation for notification signups and Book request flows (phases 6-8). The research confirms that Supabase's cloud-hosted platform with Next.js 15 App Router integration via the `@supabase/ssr` package provides a production-ready authentication and database solution. Resend offers straightforward email delivery with custom domain support. The critical technical challenge is implementing cookie-based JWT authentication with middleware while maintaining Next.js static route optimization.

The standard stack leverages Supabase's Row Level Security (RLS) for data protection, with performance-critical indexes on policy-referenced columns. Email delivery through Resend requires DNS configuration (SPF, DKIM, DMARC) but integrates cleanly with Next.js Server Actions. The free tier's 7-day inactivity pausing necessitates a Pro upgrade path before launch.

**Primary recommendation:** Use `@supabase/ssr` with cookie-based authentication, enable RLS immediately after table creation, index all policy columns, and prepare for Pro tier upgrade before production launch.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Supabase hosting:**
- Free tier to start (will need Pro upgrade before launch due to 1-week inactivity pausing)
- Cloud-hosted Supabase (not self-hosted)
- US West region
- Project created from scratch — no existing project

**Email provider:**
- Resend for production SMTP
- Account created from scratch — no existing Resend account
- Custom domain for sending (user owns a domain, DNS records needed)
- Sender address: noreply@[domain]

**Data to capture:**
- Notification signups: name + email only (minimal friction)
- Book requests: track which specific Book was requested (Publishers, Agents, or Therapists)
- Shared email record — one person who signs up AND requests a Book is a single row, not duplicated
- Track signup date only (verification status is boolean, not timestamped)

**Environment strategy:**
- Three contexts: Local dev, Vercel preview deploys, Production
- Preview and prod share the same Supabase project (acceptable for pre-launch)
- Secrets via .env.local for local dev + Vercel environment variables for preview/prod
- Site deployed on Vercel (Next.js)

### Claude's Discretion

- Database schema details (column types, indexes, constraints)
- Row Level Security policy design
- JWT middleware implementation approach
- How to handle static vs dynamic route collisions in Next.js

### Specific Ideas

- Free tier pausing is a known concern — plan should note upgrade path to Pro before launch
- Shared data model: one email record serves both notification signup and Book request flows

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | Latest | Supabase client library | Official SDK, required for all Supabase interactions |
| `@supabase/ssr` | Latest | Server-side auth for Next.js | Cookie-based auth specifically designed for App Router SSR |
| `resend` | Latest | Email delivery SDK | Modern email API, simpler than Nodemailer, React Email integration |
| Next.js | 15+ | Full-stack framework | Already in use (package.json shows "next": "^15") |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-email` | Latest | Email templates as React components | Optional but recommended for maintainable email templates |
| `zod` | Latest | Runtime validation for Server Actions | Recommended for validating form inputs before Supabase mutations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend | Nodemailer + AWS SES | More complex setup, lower cost at scale (but irrelevant for pre-launch) |
| Cookie auth (`@supabase/ssr`) | localStorage JWT | Vulnerable to XSS, doesn't support SSR, not recommended by Supabase |
| Supabase Edge Functions | Next.js API Routes | Edge Functions run closer to users globally, but Next.js routes simpler for tightly-coupled logic |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr resend
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── send/
│   │       └── route.ts        # Email sending endpoint (if needed)
│   └── actions/                # Server Actions for mutations
│       ├── signup.ts           # Notification signup action
│       └── request-book.ts     # Book request action
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (Client Components)
│   │   ├── server.ts           # Server client (Server Components, Route Handlers)
│   │   └── middleware.ts       # Middleware client (auth refresh)
│   └── resend/
│       └── client.ts           # Resend client instance
└── middleware.ts               # Root middleware for auth token refresh
```

### Pattern 1: Cookie-Based Authentication with Middleware
**What:** Middleware refreshes auth tokens and stores them in cookies, avoiding localStorage vulnerabilities and enabling SSR.

**When to use:** All Supabase auth implementations in Next.js App Router (this is the standard pattern).

**Example:**
```typescript
// src/lib/supabase/middleware.ts
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh auth token by calling getClaims() (validates JWT)
  await supabase.auth.getClaims()

  return response
}
```

```typescript
// middleware.ts (root level)
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Exclude static assets and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 2: Server Actions with Revalidation
**What:** Use Server Actions for Supabase mutations, always call `revalidatePath()` before `redirect()` to ensure fresh data.

**When to use:** All form submissions and data mutations.

**Example:**
```typescript
// src/app/actions/signup.ts
// Source: https://makerkit.dev/blog/tutorials/nextjs-server-actions
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  const supabase = createClient()

  const { error } = await supabase
    .from('notifications')
    .insert({ email, name })

  if (error) {
    return { error: error.message }
  }

  // CRITICAL: Revalidate BEFORE redirect
  revalidatePath('/')
  redirect('/thank-you')
}
```

### Pattern 3: RLS Policies with Indexed Columns
**What:** Wrap functions in SELECT subqueries for caching, always index policy-referenced columns.

**When to use:** All RLS policies.

**Example:**
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security

-- ENABLE RLS FIRST (critical step)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Good: Wrapped in SELECT for performance (up to 99.94% faster)
CREATE POLICY "Users can read their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- CRITICAL: Index the policy column
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

### Pattern 4: Email Sending via Server Actions
**What:** Use Resend SDK in Server Actions (never in Client Components) to send emails.

**When to use:** Email verification, notifications, confirmations.

**Example:**
```typescript
// src/app/actions/send-verification.ts
// Source: https://resend.com/docs/send-with-nextjs
'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const { data, error } = await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: email,
    subject: 'Verify your email',
    html: `<p>Click <a href="https://yoursite.com/verify?token=${token}">here</a> to verify.</p>`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
```

### Anti-Patterns to Avoid

- **Don't use `getSession()` for auth checks:** Use `getClaims()` or `getUser()` in server code. `getSession()` doesn't revalidate the JWT.
- **Don't test RLS in SQL Editor:** SQL Editor runs as postgres superuser, bypassing RLS. Test from client SDK.
- **Don't expose service_role key:** Never use in client code. It bypasses RLS entirely.
- **Don't create tables without RLS:** Enable RLS immediately, then add policies. Tables without RLS are wide open.
- **Don't use NEXT_PUBLIC_ for secrets:** Only use for truly public values (Supabase URL and anon key). Never for API keys.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery | Custom SMTP with Nodemailer | Resend SDK | Handles DNS complexity (SPF, DKIM, DMARC), deliverability optimization, bounce handling |
| JWT refresh logic | Manual token expiry checks | `@supabase/ssr` middleware | Handles cookie storage, PKCE flow, token refresh, race conditions |
| Database auth | Custom user tables + bcrypt | Supabase Auth | Provides magic links, OAuth, MFA, rate limiting, security audits |
| Row-level security | Application-layer checks only | PostgreSQL RLS + app checks | Defense-in-depth: RLS enforces at DB level regardless of client |
| Email verification tokens | UUIDs + expiry tracking | Supabase magic links | Handles expiry (1 hour), one-time use, rate limiting (60s cooldown) |

**Key insight:** Authentication and email delivery have deceptively complex edge cases (CSRF, token refresh race conditions, email deliverability, DNS records). Use battle-tested libraries rather than rebuilding these systems.

---

## Common Pitfalls

### Pitfall 1: Forgot to Enable RLS
**What goes wrong:** Tables created in Supabase have RLS disabled by default. You create policies but forget `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, leaving data wide open.

**Why it happens:** SQL Editor runs as superuser (bypasses RLS), so you test queries and see expected results, deploy, then real users see nothing—or worse, see everything.

**How to avoid:**
1. Enable RLS immediately after creating table
2. Test policies from client SDK, never SQL Editor
3. Use Supabase Studio's "Impersonate User" feature for testing

**Warning signs:**
- Queries work in SQL Editor but fail in app
- Users can see data they shouldn't
- CVE-2025-48757 affected 170+ apps due to this exact issue

### Pitfall 2: Missing Indexes on Policy Columns
**What goes wrong:** A policy like `user_id = auth.uid()` triggers a sequential scan on the entire table if `user_id` isn't indexed. On 10,000 rows, query takes 50ms instead of 2ms. On 1,000,000 rows, it times out.

**Why it happens:** Postgres doesn't auto-index foreign keys or policy columns. Developers add policies without considering query plans.

**How to avoid:**
- Index every non-primary-key column referenced in any RLS policy
- Use `EXPLAIN ANALYZE` to check query plans
- Wrap functions in SELECT: `(SELECT auth.uid()) = user_id` for caching

**Warning signs:**
- Slow queries as data grows
- Timeout errors on simple selects
- High CPU usage on database

### Pitfall 3: NEXT_PUBLIC_ Variable Confusion
**What goes wrong:** You add sensitive keys (like `RESEND_API_KEY`) with `NEXT_PUBLIC_` prefix, accidentally exposing them in the client bundle. Or you forget the prefix for public values (like `SUPABASE_URL`), causing client-side code to fail.

**Why it happens:** Confusion about Next.js build-time inlining. `NEXT_PUBLIC_` variables are baked into the JavaScript bundle at build time.

**How to avoid:**
- **Server-only (NO prefix):** `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Client-accessible (NEXT_PUBLIC_):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Review `.env.local` before every commit
- Never commit `.env.local` to git

**Warning signs:**
- API keys visible in browser DevTools Network tab
- "process.env.X is undefined" errors in browser
- Unexpected behavior between dev and production

### Pitfall 4: Stale JWT Claims
**What goes wrong:** You update user metadata (roles, permissions) in the database, but `auth.jwt()` in RLS policies still reflects old data until the next token refresh.

**Why it happens:** JWTs are issued at login/refresh time and contain a snapshot of user data. `auth.jwt()` returns claims from the token, not real-time DB state.

**How to avoid:**
- For role changes, force user to re-login or call `supabase.auth.refreshSession()`
- For frequently-changing data, query DB directly in policies (with security definer functions to avoid RLS recursion)
- Document token refresh requirements for admin features

**Warning signs:**
- Permission changes don't take effect until logout/login
- Intermittent authorization failures
- Confusion about "why isn't my role update working?"

### Pitfall 5: Preview and Prod Sharing Database (Data Contamination)
**What goes wrong:** Preview deployments share the production Supabase project. A test mutation in preview writes to prod database, corrupting production data.

**Why it happens:** User decided "Preview and prod share the same Supabase project (acceptable for pre-launch)" for cost savings, but didn't implement safeguards.

**How to avoid:**
- Prefix preview data with `preview_` or use separate schema
- Document clearly: "DO NOT test real emails in preview"
- Plan upgrade to separate preview project before launch
- Use Supabase branching (Pro tier) for isolated preview environments

**Warning signs:**
- Production data showing up in preview
- Test emails sent to real users
- Confusion about data provenance

### Pitfall 6: Middleware Matcher Excluding API Routes
**What goes wrong:** You set middleware matcher to exclude `/_next/*` but also accidentally exclude `/api/*`, causing API routes to serve stale/unauthenticated sessions.

**Why it happens:** Over-aggressive matcher patterns to avoid running middleware on static assets.

**How to avoid:**
- Use the recommended pattern: `'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'`
- Only exclude static assets and images, not functional routes
- Test authenticated API routes explicitly

**Warning signs:**
- API routes can't access user session
- Authenticated requests fail intermittently
- `supabase.auth.getUser()` returns null in API routes

### Pitfall 7: Email Verification Without Rate Limiting
**What goes wrong:** User clicks "resend verification email" multiple times rapidly, triggering dozens of emails and potential abuse/spam flagging.

**Why it happens:** Supabase defaults to 60-second cooldown, but client code doesn't enforce it.

**How to avoid:**
- Respect Supabase's 60-second magic link cooldown
- Add client-side disabled state for "Resend" button
- Implement exponential backoff for repeated requests
- Monitor Resend sending limits (Free tier: 100 emails/day, Pro: 50,000/month)

**Warning signs:**
- Multiple emails arriving simultaneously
- Resend flagging domain for spam
- Rate limit errors from Supabase

---

## Code Examples

Verified patterns from official sources:

### Database Schema for Shared Email Model
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
-- User constraint: "Shared email record — one person who signs up AND requests a Book is a single row"

CREATE TABLE public.contacts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  signed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for case-insensitive email lookups
CREATE INDEX idx_contacts_email_lower ON contacts(LOWER(email));

CREATE TABLE public.book_requests (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  book_type TEXT NOT NULL CHECK (book_type IN ('publishers', 'agents', 'therapists')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for policy performance
CREATE INDEX idx_book_requests_contact_id ON book_requests(contact_id);

-- Enable RLS IMMEDIATELY
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Example policies (PUBLIC read for unauthenticated signups)
CREATE POLICY "Anyone can insert contacts"
ON contacts
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anyone can insert book requests"
ON book_requests
FOR INSERT
TO anon
WITH CHECK (true);
```

**Note on primary keys:** Research shows `BIGSERIAL` is 3x faster than UUID for inserts and uses half the storage. Use `BIGSERIAL` for internal IDs unless you need distributed/unpredictable IDs.

### Server-Side Client Creation
```typescript
// src/lib/supabase/server.ts
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle the case where cookies() is called in a route handler
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle the case where cookies() is called in a route handler
          }
        },
      },
    }
  )
}
```

### Browser Client Creation
```typescript
// src/lib/supabase/client.ts
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Environment Variables Setup
```bash
# .env.local (for local development)
# Source: https://vercel.com/docs/environment-variables

# Supabase (NEXT_PUBLIC_ = client-accessible)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend (server-only, NO NEXT_PUBLIC_)
RESEND_API_KEY=re_your_api_key
```

**Vercel Setup:** Add same variables in Vercel Dashboard → Settings → Environment Variables, selecting "Production", "Preview", and "Development" as appropriate.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | Q2 2024 | Simplified API, better cookie handling, removed deprecated helpers |
| `supabase.auth.getSession()` for server checks | `supabase.auth.getClaims()` or `getUser()` | Always | `getSession()` doesn't revalidate JWT, unsafe for server-side auth |
| localStorage for JWTs | HTTP-only cookies | Next.js 13+ App Router | Eliminates XSS vulnerability, enables SSR |
| Manual RLS policy testing in SQL Editor | Test from client SDK + Studio impersonation | Always | SQL Editor bypasses RLS, giving false confidence |
| Nodemailer + raw SMTP | Resend or similar modern APIs | 2023-2024 | Simplifies DNS setup, improves deliverability |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr` in 2024
- `supabase.auth.session()`: Use `getClaims()` or `getUser()` instead
- Storing JWTs in localStorage: Security vulnerability (XSS), use cookies

---

## Open Questions

1. **Custom domain email sending: DNS propagation time**
   - What we know: Resend requires SPF, DKIM, DMARC DNS records. Propagation can take up to 24 hours.
   - What's unclear: Whether user's domain registrar has any quirks (some registrars are slower).
   - Recommendation: Add DNS records early (even before coding), verify in Resend dashboard. Plan for 24-48 hour buffer before launch.

2. **Supabase US West region: Latency for non-US users**
   - What we know: User chose US West region. Supabase Edge Functions auto-distribute globally, but Postgres database is single-region.
   - What's unclear: User's expected audience geography.
   - Recommendation: If primarily US-based audience, acceptable. If global, monitor latency and consider read replicas (Pro tier feature) post-launch.

3. **Preview/Prod sharing database: Migration path**
   - What we know: User accepted shared database for pre-launch simplicity. This is risky for production.
   - What's unclear: Timeline for separating environments.
   - Recommendation: Document clearly in PLAN.md: "Before public launch, upgrade to Pro tier and create separate preview project to avoid data contamination."

4. **Email verification flow: Magic link vs OTP**
   - What we know: Supabase supports both magic links (click URL) and OTP (enter 6-digit code). User hasn't specified preference.
   - What's unclear: UX preference for email verification.
   - Recommendation: Default to magic links (simpler UX), but design email template to support OTP switch later if needed.

---

## Sources

### Primary (HIGH confidence)
- [Supabase Next.js Server-Side Auth Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs) - Official setup guide
- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS patterns and performance
- [Resend Next.js Integration Documentation](https://resend.com/docs/send-with-nextjs) - Official email sending guide
- [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables) - Official Next.js docs
- [Supabase Choosing a Postgres Primary Key](https://supabase.com/blog/choosing-a-postgres-primary-key) - Official blog post (BIGSERIAL vs UUID)

### Secondary (MEDIUM confidence)
- [Supabase RLS Best Practices (MakerKit)](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) - Production patterns, verified with official docs
- [Next.js Server Actions Complete Guide (MakerKit)](https://makerkit.dev/blog/tutorials/nextjs-server-actions) - Revalidation patterns
- [Resend Domain Authentication Guide (DmarcDkim.com)](https://dmarcdkim.com/setup/how-to-setup-resend-spf-dkim-and-dmarc-records) - DNS setup walkthrough
- [Vercel Environment Variables Documentation](https://vercel.com/docs/environment-variables) - Deployment configuration
- [Supabase Free Tier Limitations Guide (DesignRevision)](https://designrevision.com/blog/supabase-pricing) - 2026 pricing breakdown

### Tertiary (LOW confidence, marked for validation)
- [JWT Token Management with Supabase GitHub Repository](https://github.com/devpayoub/JWT-Token-Management-with-Supabase) - Example code, not official
- [Case-Insensitive Text Search in PostgreSQL (Medium)](https://medium.com/codex/case-insensitive-text-search-in-postgresql-whats-fast-and-what-fails-f836024c4590) - Performance insights, needs testing in Supabase context

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase and Resend documentation confirm recommended packages
- Architecture: HIGH - Patterns verified against official Next.js 15 and Supabase docs
- Pitfalls: HIGH - Cross-referenced CVE-2025-48757, official RLS docs, and multiple production reports
- Database schema: MEDIUM - Design based on user constraints + PostgreSQL best practices, but not Supabase-specific guidance
- Email verification flow: MEDIUM - Supabase supports multiple patterns, user hasn't specified preference

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - Supabase is stable, but Next.js/Vercel evolve quickly)

**Research notes:**
- All official documentation checked against 2026 dates
- CVE-2025-48757 (RLS vulnerability) is recent and highly relevant
- Supabase free tier pausing confirmed as 7-day inactivity (not changed)
- `@supabase/ssr` is current (replaced `@supabase/auth-helpers-nextjs` in 2024)
