# Architecture Research: Continua v2.0 Supabase Integration

**Domain:** Next.js 15 App Router + Supabase Backend Integration
**Researched:** 2026-02-15
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                     Browser (Client Components)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │   Header   │  │   Dialogs  │  │   Forms    │  │ Sign In UI   │ │
│  │ (existing) │  │ (existing) │  │   (new)    │  │    (new)     │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘ │
│        │ Link          │ Dialog         │ Server         │ Server   │
│        │               │ Submit         │ Action         │ Action   │
├────────┴───────────────┴────────────────┴────────────────┴─────────┤
│                Next.js 15 App Router (Server Side)                  │
├────────────────────────────────────────────────────────────────────┤
│  Server Components     │  Server Actions      │  Route Handlers    │
│  ┌──────────────┐     │  ┌────────────────┐  │  ┌──────────────┐  │
│  │ Pages (.tsx) │     │  │ Form Handlers  │  │  │ /auth/confirm│  │
│  │ - /          │     │  │ - Notification │  │  │ /api/download│  │
│  │ - /my-*      │     │  │ - Book Request │  │  │              │  │
│  │ (new pages)  │     │  │ (new actions)  │  │  │  (new routes)│  │
│  └──────┬───────┘     │  └───────┬────────┘  │  └──────┬───────┘  │
│         │             │          │            │         │          │
├─────────┴─────────────┴──────────┴────────────┴─────────┴──────────┤
│                     Middleware (Cookie Proxy)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Token Refresh + Cookie Sync (supabase.auth.getClaims())     │  │
│  └────────────────────────────┬─────────────────────────────────┘  │
├────────────────────────────────┴───────────────────────────────────┤
│                      Supabase Client Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Browser   │  │   Server    │  │ Route/Action│                │
│  │   Client    │  │   Client    │  │   Client    │                │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
│         │                │                 │                        │
├─────────┴────────────────┴─────────────────┴────────────────────────┤
│                         Supabase Backend                            │
├────────────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)   │  Auth           │  Storage              │
│  ┌──────────────────┐    │  ┌───────────┐  │  ┌──────────────┐    │
│  │ notification_    │    │  │ auth.users│  │  │ book-pdfs/   │    │
│  │   signups        │    │  │           │  │  │ (private)    │    │
│  │ ┌──────────────┐ │    │  └───────────┘  │  └──────────────┘    │
│  │ │ book_requests│ │    │                  │                       │
│  │ └──────────────┘ │    │  Email Service   │                       │
│  └──────────────────┘    │  (verification)  │                       │
└────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Integration Point |
|-----------|----------------|-------------------|
| **Header (existing)** | Navigation, dropdowns, Sign In trigger | Modified: merge Who/What dropdowns, trigger auth flow |
| **Dialog Components (existing)** | Book request forms (Publishers, Agents, Therapists) | Modified: add form submission to Server Actions |
| **Coming Soon Dialog (new)** | Placeholder for unavailable features | Created: reuse Headless UI pattern |
| **Server Actions (new)** | Form submissions, DB writes | Created: handle notification signups, book requests |
| **Route Handlers (new)** | Email verification, PDF downloads | Created: /auth/confirm, /api/download/[book] |
| **Middleware (new)** | Session refresh, cookie management | Created: supabase.auth.getClaims() proxy |
| **Supabase Clients (new)** | Database/auth operations | Created: browser, server, route/action clients |

## Recommended Project Structure

```
/Users/shantam/continua/
├── .env.local                    # Supabase env vars (NEXT_PUBLIC_*, private keys)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # EXISTING: Root layout
│   │   ├── page.tsx              # EXISTING: Home page
│   │   ├── my-relationships/     # NEW: replaces /who
│   │   │   └── page.tsx
│   │   ├── my-info/              # NEW: replaces /what
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   └── confirm/
│   │   │       └── route.ts      # NEW: Email verification callback
│   │   ├── api/
│   │   │   └── download/
│   │   │       └── [book]/
│   │   │           └── route.ts  # NEW: Authenticated PDF downloads
│   │   └── globals.css           # EXISTING: Tailwind @theme
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx        # MODIFIED: Merge dropdowns, new nav structure
│   │   ├── dialogs/
│   │   │   ├── PublishersDialog.tsx    # MODIFIED: Add form submission
│   │   │   ├── AgentsDialog.tsx        # MODIFIED: Add form submission
│   │   │   ├── TherapistsDialog.tsx    # MODIFIED: Add form submission
│   │   │   └── ComingSoonDialog.tsx    # NEW: Generic coming soon
│   │   └── forms/                # NEW: Form components
│   │       ├── NotificationSignup.tsx  # NEW: Email notification form
│   │       └── BookRequestForm.tsx     # NEW: Shared book request logic
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # NEW: Browser client (createBrowserClient)
│   │   │   ├── server.ts         # NEW: Server component client
│   │   │   └── action.ts         # NEW: Server Action client
│   │   └── actions/              # NEW: Server Actions
│   │       ├── notifications.ts  # NEW: Notification signup action
│   │       └── book-requests.ts  # NEW: Book request submission
│   └── middleware.ts             # NEW: Supabase session refresh proxy
└── supabase/
    └── migrations/               # NEW: Database schema
        └── 001_initial_schema.sql
```

### Structure Rationale

- **lib/supabase/**: Three separate client creators following official Supabase SSR pattern. Browser client for client components, server client for Server Components, action client for Server Actions/Route Handlers.
- **lib/actions/**: Server Actions colocated with business logic. These are imported by client components for form submissions.
- **app/my-***: New page routes replacing /who and /what. Named to reflect user-centric perspective.
- **app/auth/confirm/**: Route Handler for email verification. Must be a route (not action) because it's called via URL from email.
- **app/api/download/[book]/**: Route Handler for PDF downloads. Must be API route because it serves files with custom headers.
- **components/forms/**: Extracted form logic for reuse across dialogs. Keeps dialogs focused on presentation.
- **middleware.ts**: Root-level middleware intercepts all requests to refresh auth tokens via cookie proxy.

## Architectural Patterns

### Pattern 1: Three-Client Supabase Architecture

**What:** Create three distinct Supabase client instances for different execution contexts.

**When to use:** Always in Next.js 15 App Router with Supabase. Server Components can't write cookies, clients execute in different environments.

**Trade-offs:**
- PRO: Type-safe, environment-appropriate, prevents auth bugs
- PRO: Official Supabase pattern with best security practices
- CON: Slight complexity managing three clients
- CON: Must remember which client to use where

**Example:**
```typescript
// lib/supabase/client.ts (Browser - Client Components)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

// lib/supabase/server.ts (Server Components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// lib/supabase/action.ts (Server Actions & Route Handlers)
// Same as server.ts but used in actions/route handlers
```

### Pattern 2: Server Actions for Form Submissions

**What:** Use Server Actions (not API routes) for form submissions from React components.

**When to use:** Form submissions tightly coupled to UI (notification signups, book requests). No external clients need these endpoints.

**Trade-offs:**
- PRO: Type-safe by default when called from same Next.js app
- PRO: Simpler than API routes (no need to define HTTP methods, parse bodies)
- PRO: Automatic integration with React 19 useActionState/useFormStatus
- CON: Can't be called from external sources (webhooks, mobile apps)
- CON: No predefined URL endpoint

**Example:**
```typescript
// lib/actions/notifications.ts
'use server'

import { createClient } from '@/lib/supabase/action'
import { revalidatePath } from 'next/cache'

export async function submitNotificationSignup(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  const supabase = await createClient()

  const { error } = await supabase
    .from('notification_signups')
    .insert({ email, name })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// components/forms/NotificationSignup.tsx
'use client'

import { submitNotificationSignup } from '@/lib/actions/notifications'
import { useActionState } from 'react'

export function NotificationSignup() {
  const [state, formAction] = useActionState(submitNotificationSignup, null)

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Subscribe</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  )
}
```

### Pattern 3: Route Handlers for URL-Based Operations

**What:** Use Route Handlers (API routes) for operations that need URL endpoints.

**When to use:** Email verification callbacks (called from email links), file downloads, webhooks, external API access.

**Trade-offs:**
- PRO: Have URL endpoints that can be called externally
- PRO: Support all HTTP methods with full control
- PRO: Can set custom response headers (needed for file downloads)
- CON: More boilerplate than Server Actions
- CON: Manual type safety (must parse request bodies)

**Example:**
```typescript
// app/auth/confirm/route.ts
import { createClient } from '@/lib/supabase/action'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/error', request.url))
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    type: type as any,
    token_hash,
  })

  if (error) {
    return NextResponse.redirect(new URL('/error', request.url))
  }

  // Email verified, redirect to app
  return NextResponse.redirect(new URL('/my-info', request.url))
}

// app/api/download/[book]/route.ts
import { createClient } from '@/lib/supabase/action'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { book: string } }
) {
  const supabase = await createClient()

  // Check auth and book request verification
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: bookRequest } = await supabase
    .from('book_requests')
    .select('verified')
    .eq('email', user.email)
    .eq('type', params.book)
    .single()

  if (!bookRequest?.verified) {
    return NextResponse.json({ error: 'Not verified' }, { status: 403 })
  }

  // Generate signed URL (60 second expiry)
  const { data: signedUrl } = await supabase.storage
    .from('book-pdfs')
    .createSignedUrl(`${params.book}.pdf`, 60)

  if (!signedUrl) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // Redirect to signed URL
  return NextResponse.redirect(signedUrl.signedUrl)
}
```

### Pattern 4: Email Verification with TokenHash

**What:** Use TokenHash in custom email templates with server-side verification route.

**When to use:** Email verification flows. Prevents email prefetch issues where security tools consume links.

**Trade-offs:**
- PRO: Prevents email prefetching from invalidating tokens
- PRO: Server-side verification before user sees authenticated content
- CON: Requires custom email template configuration
- CON: Need to create route handler for verification

**Example:**
```html
<!-- Supabase Email Template (Dashboard > Auth > Email Templates > Confirm signup) -->
<h2>Confirm your signup</h2>
<p>Click the link below to confirm your email:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm Email</a></p>
```

### Pattern 5: Middleware Cookie Proxy

**What:** Middleware that refreshes auth tokens on every request by calling supabase.auth.getClaims().

**When to use:** Always with Supabase in Next.js App Router. Required for session management.

**Trade-offs:**
- PRO: Automatic token refresh on every request
- PRO: Syncs cookies between server and browser
- PRO: Validates JWT signatures (getClaims validates, getSession doesn't)
- CON: Runs on every request (minimal overhead)

**Example:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // CRITICAL: Use getClaims() not getSession()
  // getClaims() validates JWT signature on each invocation
  await supabase.auth.getClaims()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Data Flow

### Form Submission Flow (Notification Signup)

```
User fills form in Dialog
    ↓
Form submits to Server Action (submitNotificationSignup)
    ↓
Server Action creates Supabase client (action client)
    ↓
Server Action inserts into notification_signups table
    ↓
Return success/error to client
    ↓
Dialog shows confirmation or error message
```

### Email Verification Flow (Book Request)

```
User submits book request form (email required)
    ↓
Server Action:
  1. Insert book_requests row (verified: false, token: generated UUID)
  2. Send verification email via Resend/Supabase Edge Function
     Email contains: /auth/confirm?token_hash={{ .TokenHash }}&type=email
    ↓
User clicks email link
    ↓
Route Handler (/auth/confirm/route.ts):
  1. Extract token_hash from URL
  2. Call supabase.auth.verifyOtp({ token_hash, type: 'email' })
  3. Mark book_requests.verified = true
  4. Redirect to /my-info with success message
    ↓
User can now download PDF from /api/download/[book]
```

### PDF Download Flow (Authenticated)

```
User clicks "Download PDF" link
    ↓
Route Handler (/api/download/[book]/route.ts):
  1. Middleware refreshes auth tokens via getClaims()
  2. Route handler checks user authentication
  3. Query book_requests for user's email + book type
  4. Verify book_requests.verified = true
  5. Generate signed URL from Supabase Storage (60s expiry)
  6. Redirect user to signed URL
    ↓
Supabase Storage serves PDF via CDN
    ↓
Browser downloads file
```

### Navigation Restructure Flow

```
BEFORE (v1.0):
Header
├── Who dropdown (disabled on /who)
│   └── All items → /who
├── What dropdown (disabled on /what)
│   └── All items → /what
└── Book dropdown
    └── Opens dialogs

AFTER (v2.0):
Header
├── Learn dropdown (merged Who + What content)
│   ├── For Individuals → /my-relationships
│   ├── For Couples → /my-relationships
│   ├── For Families → /my-relationships
│   ├── For Teams → /my-relationships
│   ├── separator
│   ├── Take a Test → ComingSoonDialog
│   ├── See Results → ComingSoonDialog
│   └── Tools and Actions → ComingSoonDialog
├── My Info → /my-info
├── My Relationships → /my-relationships
├── Book dropdown
│   └── Opens dialogs (now with form submission)
└── Sign In → Auth flow (coming soon)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is perfect. Static pages + Supabase. No changes needed. |
| 1k-10k users | Add database indices on book_requests(email, verified). Consider caching signed URLs for repeated downloads (same user, same book within expiry window). |
| 10k-100k users | Move email sending to Supabase Edge Functions for better rate limiting. Consider CDN for static assets. Database connection pooling via Supabase built-in. |
| 100k+ users | Evaluate Supabase Pro for dedicated resources. Add Redis for session caching. Consider separating notification_signups to separate table with partitioning. |

### Scaling Priorities

1. **First bottleneck:** Database writes (notification signups, book requests). Fix: Add indices on frequently queried columns (email, type, verified). Consider rate limiting form submissions per IP.

2. **Second bottleneck:** Email sending volume. Fix: Use Supabase Edge Functions with Resend for better deliverability. Implement queuing for non-critical emails. Add retry logic.

3. **Third bottleneck:** PDF downloads (Storage bandwidth). Fix: Supabase Storage includes global CDN. Signed URLs are cached at edge. Consider longer expiry times (5-10 min) to reduce API calls for repeated downloads.

## Anti-Patterns

### Anti-Pattern 1: Using getSession() in Server Components

**What people do:** Call `supabase.auth.getSession()` in Server Components to check authentication.

**Why it's wrong:** `getSession()` does NOT validate JWT signatures. An attacker can forge session cookies. Only `getClaims()` validates against Supabase's public keys.

**Do this instead:**
```typescript
// BAD
const { data: { session } } = await supabase.auth.getSession()
if (session) { /* user is authenticated */ }

// GOOD
const { data: { user } } = await supabase.auth.getClaims()
if (user) { /* user is authenticated AND validated */ }
```

### Anti-Pattern 2: Single Supabase Client for All Contexts

**What people do:** Create one Supabase client and import it everywhere.

**Why it's wrong:** Server Components can't write cookies (read-only). Browser client needs different cookie handling than server. Mixing contexts causes auth bugs.

**Do this instead:**
```typescript
// BAD
// lib/supabase.ts
export const supabase = createClient(url, key)

// GOOD
// lib/supabase/client.ts (browser)
export function createClient() { return createBrowserClient(...) }

// lib/supabase/server.ts (server components)
export async function createClient() { return createServerClient(...) }

// lib/supabase/action.ts (server actions/routes)
export async function createClient() { return createServerClient(...) }
```

### Anti-Pattern 3: Forgetting to Call cookies() in Server Actions

**What people do:** Call Supabase directly in Server Actions without calling Next.js `cookies()` first.

**Why it's wrong:** Next.js caches aggressively. Without `cookies()`, Server Actions may serve cached data to wrong users.

**Do this instead:**
```typescript
// BAD
'use server'
export async function myAction() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return data
}

// GOOD
'use server'
import { cookies } from 'next/headers'

export async function myAction() {
  await cookies() // Opts out of Next.js caching
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return data
}
```

### Anti-Pattern 4: Public Buckets for User-Gated Content

**What people do:** Store PDFs in public Supabase Storage bucket, rely on obscure URLs for "security."

**Why it's wrong:** Public bucket URLs are guessable. Anyone can download PDFs without verification.

**Do this instead:**
```typescript
// BAD
// Storage bucket: public
// Download: https://project.supabase.co/storage/v1/object/public/book-pdfs/agents.pdf

// GOOD
// Storage bucket: private
// Download: Generate signed URL after verifying book_requests.verified
const { data: signedUrl } = await supabase.storage
  .from('book-pdfs')
  .createSignedUrl('agents.pdf', 60)
```

### Anti-Pattern 5: API Routes for Form Submissions

**What people do:** Create API route for every form submission (notification signup, book request).

**Why it's wrong:** Server Actions are simpler, type-safe by default, integrate with React 19 hooks. API routes add unnecessary HTTP layer for internal operations.

**Do this instead:**
```typescript
// BAD
// app/api/notifications/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  // validate, insert to DB
}

// Client component
const response = await fetch('/api/notifications', {
  method: 'POST',
  body: JSON.stringify({ email, name })
})

// GOOD
// lib/actions/notifications.ts
'use server'
export async function submitNotification(formData: FormData) {
  // insert to DB
}

// Client component
import { submitNotification } from '@/lib/actions/notifications'
const [state, formAction] = useActionState(submitNotification, null)
<form action={formAction}>...</form>
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Supabase Auth** | Middleware + Three-client pattern | Middleware refreshes tokens. Browser/server/action clients. Use getClaims() not getSession(). |
| **Supabase Database** | Direct via Supabase client | PostgreSQL via Supabase client. RLS policies for auth. No ORM needed. |
| **Supabase Storage** | Private buckets + signed URLs | Store PDFs in private bucket. Generate 60s signed URLs after auth check. |
| **Email Sending** | Resend via Supabase Edge Function OR Supabase built-in | Option 1: Resend for custom templates. Option 2: Supabase auth emails for verification. Configure TokenHash in templates. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Client Components ↔ Server Actions** | Direct import + useActionState | Server Actions are 'use server' functions. Import directly in client components. React 19 useActionState hook for form state. |
| **Server Components ↔ Database** | Direct Supabase query | Server Components can query database directly. No API layer needed for internal pages. |
| **Client Components ↔ Route Handlers** | fetch() or redirect | Email verification callback (URL from email). PDF downloads (file serving). |
| **Dialogs ↔ Forms** | Component composition | Extract form logic to components/forms/. Dialogs import and render forms. Keeps concerns separated. |
| **Header ↔ New Pages** | Next.js Link component | Use <Link> for navigation. Disable dropdown on current page (existing pattern). |

## Database Schema

### Tables

**notification_signups**
```sql
CREATE TABLE notification_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_notification_signups_email ON notification_signups(email);
```

**book_requests**
```sql
CREATE TABLE book_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  type text NOT NULL CHECK (type IN ('publishers', 'agents', 'therapists')),
  verified boolean DEFAULT false NOT NULL,
  token uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  verified_at timestamptz
);

CREATE INDEX idx_book_requests_email_type ON book_requests(email, type);
CREATE INDEX idx_book_requests_verified ON book_requests(verified) WHERE verified = true;
```

**Row Level Security (RLS)**
```sql
-- Enable RLS
ALTER TABLE notification_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- notification_signups: Anyone can insert, only authenticated can read
CREATE POLICY "Anyone can signup" ON notification_signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read signups" ON notification_signups
  FOR SELECT USING (auth.role() = 'authenticated');

-- book_requests: Anyone can insert, users can read their own
CREATE POLICY "Anyone can request books" ON book_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own requests" ON book_requests
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "System can update verification" ON book_requests
  FOR UPDATE USING (true)
  WITH CHECK (true);
```

### Storage Buckets

**book-pdfs (private)**
```sql
-- Create private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-pdfs', 'book-pdfs', false);

-- RLS policy: Only system can read (via signed URLs)
CREATE POLICY "System access only" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-pdfs' AND auth.role() = 'authenticated');
```

## Environment Variables

```bash
# .env.local

# Supabase Configuration (from Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: If using Resend for custom emails
RESEND_API_KEY=re_123456789

# Site URL (for email verification redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_SITE_URL=https://continua.com  # Production
```

## Build Order & Dependencies

### Phase 1: Supabase Foundation
1. Create Supabase project
2. Set up environment variables (.env.local)
3. Create database schema (migrations)
4. Create storage bucket (book-pdfs, private)
5. Create Supabase client utilities (lib/supabase/*.ts)
6. Create middleware (middleware.ts)

**Dependencies:** None. This must be done first.

### Phase 2: Navigation Restructure
1. Rename /who to /my-relationships
2. Rename /what to /my-info
3. Update Header component (merge dropdowns)
4. Create ComingSoonDialog component
5. Update all internal links

**Dependencies:** Phase 1 (middleware for auth state in header)

### Phase 3: Form Submission Infrastructure
1. Create Server Actions (lib/actions/*.ts)
2. Create form components (components/forms/*.ts)
3. Update existing dialogs to use forms
4. Add form validation

**Dependencies:** Phase 1 (Supabase clients), Phase 2 (dialogs work)

### Phase 4: Email Verification
1. Configure Supabase email templates (Dashboard)
2. Create /auth/confirm route handler
3. Update book request Server Action to trigger email
4. Test verification flow

**Dependencies:** Phase 3 (form submissions work)

### Phase 5: PDF Download
1. Upload PDFs to Supabase Storage
2. Create /api/download/[book] route handler
3. Add download links to verified users
4. Test signed URL generation

**Dependencies:** Phase 4 (verification must work first)

## Sources

**Architecture & Patterns:**
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Supabase Next.js Server-Side Auth Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Server Actions vs Route Handlers (Wisp CMS)](https://www.wisp.blog/blog/server-actions-vs-api-routes-in-nextjs-15-which-should-i-use)
- [MakerKit: API Routes vs Server Actions](https://makerkit.dev/docs/next-supabase/how-to/api/api-routes-vs-server-actions)

**Supabase Integration:**
- [Supabase Auth with Next.js Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Creating Supabase SSR Clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Next.js User Management Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

**Email & Verification:**
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Custom Auth Emails with Resend](https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend)
- [Resend + Supabase Edge Functions](https://resend.com/docs/send-with-supabase-edge-functions)

**Storage & File Serving:**
- [Supabase Storage Downloads](https://supabase.com/docs/guides/storage/serving/downloads)
- [Supabase Storage Buckets Guide](https://supabase.com/docs/guides/storage/buckets/fundamentals)

**User Management & Database:**
- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase Auth Signup API](https://supabase.com/docs/reference/javascript/auth-signup)

---
*Architecture research for: Continua v2.0 Supabase Integration*
*Researched: 2026-02-15*
