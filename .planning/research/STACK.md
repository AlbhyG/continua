# Stack Research

**Domain:** Personality assessment platform with Supabase backend
**Researched:** 2026-02-15
**Confidence:** HIGH

## Context

This is a **SUBSEQUENT MILESTONE** research. v1.0 already validated:
- Next.js 15 App Router + TypeScript + React 19
- Tailwind CSS v4 with @theme configuration
- @headlessui/react for dropdowns
- Static page generation

**This document covers ONLY stack additions for v2.0 features:**
- Supabase backend (Postgres + email)
- Sign In/Up notification signup dialogs
- Book dialogs with email verification → PDF download
- Improved responsive layout (tablet/PC breakpoints)

## New Stack Additions for v2.0

### Backend & Database

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @supabase/supabase-js | ^2.95.3 | Supabase JavaScript client | Core library for interacting with Supabase backend. Latest stable release (published Feb 2026). Provides type-safe API for database operations, authentication, and storage. Industry standard for Next.js + Supabase integration. |
| @supabase/ssr | ^0.8.0 | Server-side rendering helpers for Supabase Auth | **REQUIRED for Next.js App Router SSR.** Handles cookie-based session management for Server Components, Server Actions, and Route Handlers. Replaces deprecated @supabase/auth-helpers packages. Provides createServerClient and createBrowserClient utilities. |

**Why Supabase for this project:**
- Postgres database with Row-Level Security (RLS) for secure data access
- Built-in email sending via SMTP (configurable with external providers)
- Email verification flows via Auth API (signup confirmation, passwordless magic links)
- Generous free tier sufficient for MVP validation
- Official Next.js integration with App Router support

**Critical setup requirements:**
1. Create separate Supabase clients for Server Components (server-side) vs Client Components (browser)
2. Add middleware.ts with updateSession from @supabase/ssr to prevent session expiry
3. Configure environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Enable custom SMTP provider in Supabase dashboard for production email delivery

### Form Handling & Validation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | ^7.71.1 | Form state management | **REQUIRED** for Sign In/Up and Book dialogs. Handles form state, validation triggers, error display with minimal re-renders. React 19 compatible. Better performance than Formik for controlled inputs. |
| zod | ^4.3.6 | TypeScript-first schema validation | **REQUIRED** for type-safe form validation. Define schemas once, use on both client (instant feedback) and server (security). Integrates seamlessly with react-hook-form via @hookform/resolvers. |
| @hookform/resolvers | ^5.2.2 | Validation library adapters for react-hook-form | **REQUIRED** to connect Zod schemas to react-hook-form. Translates Zod validation errors into react-hook-form format. |

**Why this combination:**
- Type safety across client and server (single Zod schema defines both TypeScript types and validation rules)
- Client-side instant feedback + server-side security validation with same schema
- react-hook-form minimizes re-renders (better UX than controlled forms with useState)
- Industry standard pattern for Next.js 15 + Server Actions
- Works seamlessly with @headlessui/react dialogs already in the project

**Validation pattern for this project:**
```typescript
// Shared schema (use on client AND server)
import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

// Client Component (instant feedback)
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(signupSchema),
})

// Server Action (security validation)
'use server'
export async function createUser(formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }
  // Insert to Supabase...
}
```

### Responsive Design (Tailwind CSS v4)

**No additional packages required.** Tailwind CSS v4 is already installed. For improved tablet/PC layout, configure custom breakpoints using @theme directive.

| Configuration | Purpose | Implementation |
|---------------|---------|----------------|
| Custom breakpoints via --breakpoint-* | Semantic tablet/desktop breakpoints | Add to app/globals.css under @theme directive |

**Recommended breakpoint configuration for this project:**
```css
@theme {
  /* Existing theme config... */

  /* Custom responsive breakpoints */
  --breakpoint-tablet: 48rem;    /* 768px - tablet portrait */
  --breakpoint-desktop: 64rem;   /* 1024px - desktop/laptop */
  --breakpoint-wide: 80rem;      /* 1280px - large desktop */
}
```

**Why these breakpoints:**
- **tablet (768px):** Navigation layout changes, two-column content layouts
- **desktop (1024px):** Full horizontal navigation, three-column layouts
- **wide (1280px):** Maximum content width for ultra-wide screens

**Usage in components:**
```tsx
<div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
  {/* Responsive grid */}
</div>
```

**IMPORTANT:** Tailwind CSS v4 uses @theme directive instead of tailwind.config.js. Always use rem units for breakpoints (not px) to ensure proper ordering of media queries.

### PDF File Serving

**No additional packages required.** Next.js 15 serves static files from the public folder by default.

| Feature | Implementation | Notes |
|---------|----------------|-------|
| Static PDF files | Place in public/books/ folder | Accessible at /books/filename.pdf |
| Direct download links | Use `<a href="/books/file.pdf" download>` | Browser handles download |

**For v2.0 (placeholder PDFs):**
1. Create public/books/ directory
2. Place placeholder PDFs (e.g., public/books/personality-guide.pdf)
3. Link directly: `/books/personality-guide.pdf`
4. Files served with correct Content-Type automatically

**Future enhancement (private PDFs):**
If PDFs need access control later, create API Route Handler (app/api/books/[id]/route.ts) that:
1. Verifies email confirmation via Supabase Auth
2. Streams PDF from Supabase Storage or private folder
3. Returns Response with appropriate headers

**For now:** Public folder is sufficient for v2.0 placeholder PDFs.

### Email Verification Flow

**No additional packages required.** Handled by @supabase/supabase-js + @supabase/ssr.

| Component | Implementation | Purpose |
|-----------|----------------|---------|
| Email template config | Supabase Dashboard → Auth → Email Templates | Customize "Confirm signup" template with verification URL |
| Verification route | app/auth/confirm/route.ts | Exchanges token_hash for session |
| Email sending | Supabase Auth (built-in) | Sends verification emails automatically on signup |

**Implementation pattern:**
1. User submits email in Book dialog
2. Server Action calls `supabase.auth.signUp({ email, options: { data: { book_requested: true } } })`
3. Supabase sends verification email (template from dashboard)
4. Email contains link: `https://yoursite.com/auth/confirm?token_hash=...&type=email`
5. Route Handler verifies token: `supabase.auth.verifyOtp({ token_hash, type: 'email' })`
6. Redirect to PDF download page

**Email provider options:**
- **Development:** Use Supabase's default SMTP (restricted to team members only)
- **Production:** Configure custom SMTP in Supabase dashboard:
  - **Recommended:** Resend (simplest, dedicated to transactional email)
  - **Alternative:** SendGrid, Mailgun, AWS SES (more features, higher complexity)

**For v2.0:** Use default SMTP for testing. Add custom SMTP before launch.

## Installation

```bash
# Backend & Database
npm install @supabase/supabase-js@^2.95.3 @supabase/ssr@^0.8.0

# Form Handling & Validation
npm install react-hook-form@^7.71.1 zod@^4.3.6 @hookform/resolvers@^5.2.2
```

**Total new dependencies:** 5 packages (all production dependencies, no dev dependencies needed)

## What NOT to Install

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @supabase/auth-helpers-nextjs | Deprecated as of 2025. No longer maintained. | @supabase/ssr (current official package) |
| prisma, drizzle-orm | Adds ORM layer over Supabase Postgres. Unnecessary complexity for this project's simple schema (users table, notifications table). | Direct Supabase client queries |
| formik | Older form library with more re-renders. Not optimized for React 19. | react-hook-form |
| yup | JavaScript-first validation (no TypeScript inference). Larger bundle size. | zod (TypeScript-first) |
| nodemailer, @sendgrid/mail | Manual email sending. Requires managing SMTP credentials in code. | Supabase Auth email (built-in, configured via dashboard) |
| joi | Server-side only validation. Cannot share schemas with client. | zod (works on both client and server) |
| next-auth / auth.js | Full authentication system. Overkill for this project (only needs email collection + verification, no passwords/sessions). | Supabase Auth (simpler, built-in to backend) |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Supabase | Firebase | When you need Google's ecosystem integration, Firestore's real-time sync, or are already using GCP. Avoid if you prefer SQL databases or need Postgres-specific features. |
| Supabase | PlanetScale + Clerk | When you need separate database and auth providers, or want more auth customization. More complex setup, higher cost at scale. |
| react-hook-form | Formik | Never for new projects. Formik is maintenance mode. react-hook-form has better performance and React 19 support. |
| zod | TypeScript + manual validation | Only for extremely simple forms (1-2 fields). Not worth it once you have 3+ fields or need server validation. |
| zod | yup | When migrating existing yup codebase. Otherwise always choose zod for TypeScript-first approach. |
| Public folder PDFs | Supabase Storage | When PDFs need access control (private files). For public placeholder PDFs, public folder is simpler. |

## Stack Patterns by Feature

### Feature: Sign In/Up Notification Signup Dialog

**Pattern:**
1. @headlessui/react Dialog (already installed) for modal UI
2. react-hook-form + zod for form handling
3. Server Action validates with zod, inserts to Supabase
4. No email verification needed (just collecting signups)

**Stack:**
- Dialog: @headlessui/react
- Form: react-hook-form + zod + @hookform/resolvers
- Backend: @supabase/supabase-js (insert to notifications table)

### Feature: Book Dialog with Email Verification

**Pattern:**
1. @headlessui/react Dialog for modal UI
2. react-hook-form + zod for email input
3. Server Action calls supabase.auth.signUp() (triggers verification email)
4. User clicks email link → app/auth/confirm/route.ts verifies token
5. Redirect to /books/download/[book-id] with confirmed session
6. Page serves PDF from public/books/ folder

**Stack:**
- Dialog: @headlessui/react
- Form: react-hook-form + zod
- Auth: @supabase/supabase-js + @supabase/ssr
- Email: Supabase Auth (no additional package)
- PDF: Next.js public folder (no additional package)

### Feature: Improved Responsive Layout

**Pattern:**
1. Define custom breakpoints in app/globals.css @theme
2. Use semantic names (tablet, desktop, wide)
3. Apply utility classes (tablet:grid-cols-2, desktop:flex-row)

**Stack:**
- Framework: Tailwind CSS v4 (already installed)
- Configuration: @theme directive in globals.css (no additional package)

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @supabase/supabase-js@^2.95.3 | @supabase/ssr@^0.8.0 | Official Supabase packages designed to work together. Keep versions in sync. |
| @supabase/ssr@^0.8.0 | Next.js@15.x | Specifically designed for Next.js App Router SSR patterns. |
| react-hook-form@^7.71.1 | React@19.x | Fully compatible with React 19. v7.x stable. v8 in beta. |
| zod@^4.3.6 | TypeScript@5.x | Works with TypeScript 5.x. v4 is latest stable (major rewrite from v3). |
| @hookform/resolvers@^5.2.2 | react-hook-form@^7.x + zod@^4.x | Supports latest versions of both libraries. |

**Critical compatibility notes:**
- @supabase/auth-helpers packages are deprecated. DO NOT install.
- @supabase/ssr must be used for Next.js App Router SSR. createServerClient is required for Server Components/Actions.
- react-hook-form v8 is in beta. Stick with v7.71.1 for production stability.
- zod v4 has breaking changes from v3. Use ^4.3.6 for new projects.

## Environment Configuration

**Required environment variables (.env.local):**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Only for Server Actions that bypass RLS

# App URL (for email verification redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_SITE_URL=https://continua.com  # Production
```

**Where to get values:**
1. Create Supabase project at supabase.com
2. Navigate to Project Settings → API
3. Copy URL and anon key (safe to expose in client-side code)
4. Copy service_role key (keep server-side only)

## Migration from v1.0 to v2.0

**What stays the same:**
- Next.js 15 App Router (no changes)
- React 19 (no changes)
- Tailwind CSS v4 (add @theme breakpoints, no package updates)
- @headlessui/react (no changes, use for new dialogs)
- TypeScript configuration (no changes)

**What's new:**
- Add Supabase packages (@supabase/supabase-js, @supabase/ssr)
- Add form packages (react-hook-form, zod, @hookform/resolvers)
- Create utils/supabase/ directory for client creation utilities
- Add middleware.ts for session management
- Add app/auth/confirm/route.ts for email verification
- Create public/books/ directory for PDF files
- Update app/globals.css with custom breakpoints

**No breaking changes.** All v1.0 code continues to work. v2.0 is purely additive.

## Database Schema (Supabase)

**Required tables for v2.0:**

```sql
-- Notifications signup table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  subscribed boolean default true
);

-- Enable Row Level Security
alter table public.notifications enable row level security;

-- Public can insert (signup form)
create policy "Anyone can signup for notifications"
  on public.notifications for insert
  with check (true);

-- Email verification tracking (if needed later)
-- For v2.0, use Supabase Auth's built-in users table
-- auth.users table is automatically created by Supabase
```

**Migration approach:**
- Use Supabase Dashboard → SQL Editor for initial schema
- Export migrations: `supabase db dump -f supabase/migrations/initial.sql`
- Version control: Commit migration files to repo
- Deploy: Run migrations via Supabase CLI or dashboard

## Sources

### Supabase Integration
- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) - Official integration guide (HIGH confidence)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs) - Official auth integration (HIGH confidence)
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - SSR patterns (HIGH confidence)
- [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) - createServerClient docs (HIGH confidence)
- [NPM: @supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js) - Version 2.95.3 (MEDIUM confidence)
- [NPM: @supabase/ssr](https://www.npmjs.com/package/@supabase/ssr) - Version 0.8.0 (MEDIUM confidence)
- [Vercel: Supabase & Next.js Starter Template](https://vercel.com/templates/next.js/supabase) - Reference implementation (MEDIUM confidence)

### Email Verification
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) - Customizing email templates (HIGH confidence)
- [Supabase Custom SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp) - SMTP setup guide (HIGH confidence)
- [Mailtrap: Supabase Send Email Tutorial](https://mailtrap.io/blog/supabase-send-email/) - Implementation patterns (MEDIUM confidence)
- [Resend: Send emails using Supabase with SMTP](https://resend.com/docs/send-with-supabase-smtp) - Recommended email provider (MEDIUM confidence)

### Form Handling & Validation
- [AbstractAPI: Type-Safe Form Validation in Next.js 15](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - Comprehensive guide (MEDIUM confidence)
- [Medium: Handling Forms in Next.js with React Hook Form, Zod, and Server Actions](https://medium.com/@techwithtwin/handling-forms-in-next-js-with-react-hook-form-zod-and-server-actions-e148d4dc6dc1) - Implementation patterns (MEDIUM confidence)
- [react-hook-form Documentation](https://react-hook-form.com/docs/useform) - Official docs (HIGH confidence)
- [NPM: react-hook-form](https://www.npmjs.com/package/react-hook-form) - Version 7.71.1 (MEDIUM confidence)
- [NPM: zod](https://www.npmjs.com/package/zod) - Version 4.3.6 (MEDIUM confidence)
- [NPM: @hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers) - Version 5.2.2 (MEDIUM confidence)

### Responsive Design
- [Tailwind CSS: Responsive Design](https://tailwindcss.com/docs/responsive-design) - Official responsive design docs (HIGH confidence)
- [Tailwind CSS: Theme variables](https://tailwindcss.com/docs/theme) - @theme configuration (HIGH confidence)
- [Border Media: Tailwind CSS 4 - Custom Breakpoints](https://bordermedia.org/blog/tailwind-css-4-breakpoint-override) - v4-specific breakpoint config (MEDIUM confidence)
- [Medium: Tailwind CSS v4 @theme Configuration](https://medium.com/@kidaneberihuntse/tailwind-css-v4-1-has-no-tailwind-config-js-heres-how-to-customize-everything-with-theme-11a19b108963) - Implementation guide (MEDIUM confidence)

### PDF Serving
- [Next.js: public folder documentation](https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder) - Official static files guide (HIGH confidence)
- [DhiWise: Mastering the Next.js Public Folder](https://www.dhiwise.com/post/mastering-the-nextjs-public-folder-a-comprehensive-guide) - Usage patterns (MEDIUM confidence)
- [Code Concisely: Download a File From App Router API](https://www.codeconcisely.com/posts/nextjs-app-router-api-download-file/) - Advanced Route Handler pattern (MEDIUM confidence)

### Database Migrations
- [Supabase: Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) - Official migration guide (HIGH confidence)
- [Supabase: Declarative database schemas](https://supabase.com/docs/guides/local-development/declarative-database-schemas) - Modern migration approach (HIGH confidence)

---
*Stack research for: Continua v2.0 (Supabase backend + email verification + responsive improvements)*
*Researched: 2026-02-15*
*Confidence: HIGH - All versions verified via npm, official Supabase docs, and official Next.js docs*
