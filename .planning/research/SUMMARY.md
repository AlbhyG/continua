# Project Research Summary

**Project:** Continua v2.0 (Supabase Backend Integration)
**Domain:** Marketing/Pre-Launch Site Evolution (Static → Interactive)
**Researched:** 2026-02-15
**Confidence:** HIGH

## Executive Summary

Continua v2.0 represents a strategic evolution from a static marketing site (v1.0) to an interactive pre-launch platform with email capture, verification, and gated content delivery. The research reveals that this transition requires careful handling of Next.js 15's static/dynamic rendering boundaries while integrating Supabase for backend functionality. The recommended approach uses a three-client Supabase architecture (browser/server/middleware), Server Actions for form submissions, and a two-step email verification flow to avoid link prefetching issues that plague standard magic link implementations.

The technical foundation is solid: Next.js 15 App Router + Supabase is a proven pattern with official documentation and extensive community validation. The stack additions are minimal (5 packages: @supabase/supabase-js, @supabase/ssr, react-hook-form, zod, @hookform/resolvers) and all integrate seamlessly with the existing v1.0 codebase. The architecture leverages established patterns - Server Components for static pages, Server Actions for form handling, Route Handlers for email verification callbacks - avoiding unnecessary complexity while maintaining type safety throughout.

The critical risk is static-to-dynamic route collision during migration. Existing static pages must remain static while new interactive features run as dynamic routes. This requires explicit rendering strategy declarations and careful separation of public (static) vs authenticated (dynamic) route segments. Secondary risks include Row Level Security misconfiguration, email verification token consumption by link prefetching, and missing SMTP configuration for production email delivery. All are addressable through foundational setup in Phase 1, before feature implementation begins.

## Key Findings

### Recommended Stack

The v2.0 stack builds on the validated v1.0 foundation (Next.js 15, React 19, Tailwind CSS v4, @headlessui/react) with targeted additions for backend functionality. All new dependencies are production-stable and officially supported for Next.js 15 App Router.

**Core technologies:**
- **@supabase/supabase-js (^2.95.3)**: Supabase JavaScript client for database operations and authentication - Latest stable release with built-in PostgreSQL access, email verification flows via Auth API, and generous free tier sufficient for MVP validation
- **@supabase/ssr (^0.8.0)**: Server-side rendering helpers REQUIRED for Next.js App Router SSR - Provides createServerClient and createBrowserClient utilities for cookie-based session management across Server Components, Server Actions, and Route Handlers
- **react-hook-form (^7.71.1)**: Form state management with minimal re-renders - React 19 compatible, industry standard for Next.js form handling, integrates seamlessly with existing @headlessui/react dialogs
- **zod (^4.3.6)**: TypeScript-first schema validation - Single source of truth for validation rules used on both client (instant feedback) and server (security), works perfectly with react-hook-form via @hookform/resolvers
- **Tailwind CSS v4 custom breakpoints**: No additional packages required - Configure tablet/desktop breakpoints via @theme directive in app/globals.css for improved responsive layout at 768px (tablet) and 1024px (desktop)

**Critical version compatibility:** @supabase/ssr is specifically designed for Next.js App Router SSR patterns. Never use deprecated @supabase/auth-helpers packages. react-hook-form v7.71.1 is production stable (v8 is in beta). zod v4 has breaking changes from v3 - always use ^4.3.6 for new projects.

### Expected Features

Users expect standard authentication and form validation patterns from modern web applications. The research identifies table stakes (must have), differentiators (competitive advantage), and anti-features (commonly requested but problematic).

**Must have (table stakes):**
- Email validation before form submission - Standard practice for all web forms, prevents invalid submissions
- Clear error messaging - Users need to know why action failed and how to fix with inline validation messages
- Email confirmation after signup - Users expect proof that signup succeeded via auto-sent confirmation
- Accessible form controls - Screen readers must announce errors and states (ARIA labels, live regions, keyboard navigation already handled by Headless UI)
- One-time use verification links - Security standard for email verification (Supabase provides by default, tokens expire after 1 hour)
- Clear "check your email" prompt - After signup, users need explicit next-step guidance

**Should have (competitive):**
- Progressive disclosure in Book flow - Multi-step verification (email → verify → download) creates trust and manages user expectations vs. long single form
- Zero-password authentication pattern - Modern UX with magic links only, simpler than traditional auth, aligns with "notify me" pre-launch use case
- Verified email gating for premium content - Double opt-in pattern validates genuine interest and prevents spam signups for PDF downloads
- Coming Soon dropdowns with visual hierarchy - Shows product depth without building features, maintains UX consistency with disabled state + helpful messaging

**Defer (v2+):**
- Resend verification email - Add when users report "didn't receive email" (15% typically need this)
- Waitlist position/count display - Add when ready to gamify signups and show social proof ("Join 1,247 people waiting")
- SMS notifications - Email sufficient for v2.0; SMS adds cost + complexity + international challenges
- Social login (Google, Apple) - Magic links simpler for notification signup; defer until converting to full user accounts

**Critical anti-feature:** Disabled submit button until valid input. This conflicts with accessibility best practices (disabled buttons lose keyboard focus, invisible to screen readers). Instead: keep button enabled at all times, show inline validation errors, prevent submission with clear messaging. Reinterpret spec as "prevent submission until valid input" rather than "disable button."

### Architecture Approach

The architecture follows the standard three-client Supabase pattern for Next.js 15 App Router, separating execution contexts (Browser, Server Components, Server Actions/Route Handlers) with distinct client instances. This prevents auth bugs from mixing client types and ensures proper cookie handling across environments.

**Major components:**
1. **Supabase Client Layer** (lib/supabase/) - Three client creators: client.ts (createBrowserClient for Client Components), server.ts (createServerClient for Server Components), action.ts (createServerClient for Server Actions/Route Handlers). Each handles cookies appropriately for its execution context.
2. **Server Actions** (lib/actions/) - Form submission handlers that validate with Zod, insert to Supabase database, and return type-safe results. Used for notification signups and book requests. Preferred over API routes for internal form submissions.
3. **Route Handlers** (app/auth/confirm/, app/api/download/[book]/) - URL-based operations that need endpoints: email verification callbacks (called from email links), PDF downloads with authentication checks. Must be routes (not actions) because they're accessed via URL.
4. **Middleware** (middleware.ts) - Session refresh proxy that runs on every request, calls supabase.auth.getClaims() to validate JWT signatures and refresh expired tokens via cookie sync. CRITICAL: use getClaims() not getSession() - only getClaims() validates signatures.
5. **Form Components** (components/forms/) - Extracted form logic with react-hook-form + zod for reuse across dialogs. Keeps dialogs focused on presentation while forms handle validation and submission.

**Data flow pattern:**
- User fills form in Dialog (Client Component)
- Form submits to Server Action (lib/actions/notifications.ts)
- Server Action creates Supabase client (action.ts), validates with Zod schema, inserts to database
- Return success/error to client
- Dialog shows confirmation or error message

**Email verification flow:**
- User submits book request form (email required)
- Server Action: insert book_requests row (verified: false), send verification email
- User clicks email link (/auth/confirm?token_hash=...)
- Route Handler: verifyOtp(), mark book_requests.verified = true, redirect to download page
- User downloads PDF via /api/download/[book] after auth + verification check

### Critical Pitfalls

Research identified 9 critical pitfalls and 6 moderate pitfalls. Top 5 critical risks that will break the project if not addressed:

1. **Static-to-Dynamic Route Collision** - Adding Supabase auth to existing static pages causes "app/ Static to Dynamic Error" which crashes the build. Next.js 15 cannot switch between static and dynamic rendering during runtime. Prevention: Audit all routes BEFORE adding Supabase, explicitly declare `export const dynamic = 'force-static'` or `'force-dynamic'`, create dedicated /download or /protected route for authenticated features separate from public static pages. Test build after each route modification.

2. **Supabase Client Initialization Chaos** - Creating clients incorrectly, mixing server and client instances, using wrong keys in wrong environments, or forgetting to refresh tokens in middleware causes silent failures and cryptic errors. Prevention: Create THREE separate client utilities (client.ts for browser, server.ts for Server Components, action.ts for actions/routes), NEVER expose SUPABASE_SERVICE_ROLE_KEY in NEXT_PUBLIC_* variables, always call supabase.auth.getUser() in middleware to refresh sessions, use getUser() not getSession() in Server Components.

3. **Row Level Security Disabled or Incomplete** - Every new Supabase table has RLS DISABLED by default. Without RLS, anyone can read/insert/update/delete ALL data through the public API. Enabling RLS without creating policies blocks legitimate queries with silent failures. Prevention: ALWAYS enable RLS when creating tables (`ALTER TABLE emails ENABLE ROW LEVEL SECURITY;`), IMMEDIATELY create policies after enabling RLS, test policies from client SDK (SQL Editor bypasses RLS), never defer security to "later."

4. **Email Verification Token Consumption by Link Prefetching** - Modern email providers (Outlook Safe Links, Gmail link scanning, corporate security tools) automatically fetch verification URLs to scan for malware BEFORE the user clicks. One-time tokens get consumed by prefetch, leaving real users with "token expired" errors. Prevention: Implement two-step verification (email link → page with button → POST action consumes token), or use 6-digit code entry instead of direct token URLs. Direct token links fail for 20%+ of users on corporate email.

5. **Missing SMTP Configuration in Production** - Supabase's default email service has 2 emails/hour limit with best-effort delivery intended for demonstration only. Production requires custom SMTP. Prevention: Configure SendGrid/AWS SES/Postmark/Resend BEFORE launching any email feature, set custom SMTP in Supabase Dashboard → Authentication → SMTP Settings, configure SPF/DKIM/DMARC for domain, test delivery to Gmail/Outlook/corporate email.

**Secondary pitfalls to address:** Environment variables without NEXT_PUBLIC_ prefix invisible to Client Components (causes "missing key" errors in browser), middleware redirect loops if auth routes not excluded from matcher, PDF files in /public/ accessible without authentication (security bypass), navigation URL changes without redirects break SEO and external links.

## Implications for Roadmap

Based on research, the project naturally divides into 5 phases that respect technical dependencies and avoid critical pitfalls through proper build order.

### Phase 1: Supabase Foundation
**Rationale:** MUST come first. All subsequent phases depend on Supabase clients, database schema, and middleware being correctly configured. Getting the three-client architecture wrong compounds into every feature. Static-to-dynamic route collision must be resolved before any interactive features are added.

**Delivers:**
- Supabase project created with environment variables configured
- Database schema with notifications and book_requests tables
- Row Level Security enabled with proper policies (prevents Pitfall #3)
- Three client utilities (browser/server/action) correctly configured (prevents Pitfall #2)
- Middleware for session refresh using getClaims()
- Explicit static/dynamic declarations on all existing routes (prevents Pitfall #1)
- Custom SMTP configured for production email (prevents Pitfall #5)

**Addresses:** Infrastructure foundation from STACK.md

**Avoids:** Critical Pitfalls #1 (static-to-dynamic collision), #2 (client initialization chaos), #3 (RLS disabled), #5 (missing SMTP), #7 (environment variables)

### Phase 2: Email Collection Infrastructure
**Rationale:** Builds on Phase 1 foundation to add simplest interactive feature (notification signup). Validates that Server Actions, form handling, and database writes work correctly before adding email verification complexity. Lower risk than starting with full verification flow.

**Delivers:**
- Server Action for notification signup (lib/actions/notifications.ts)
- Form components with react-hook-form + zod validation
- Sign In/Up dialog with email collection (modified from existing dialog)
- Loading states and error handling for form submission
- Accessible form validation (enabled button with inline errors per research)
- Database writes to notifications table with RLS verification

**Uses:** react-hook-form, zod, @hookform/resolvers from STACK.md

**Implements:** Server Actions pattern from ARCHITECTURE.md

**Avoids:** Pitfall #10 (email already verified state), #11 (missing loading states)

### Phase 3: Email Verification Flow
**Rationale:** Adds email verification complexity after basic form submission is proven. Two-step verification flow prevents link prefetching issues. Route Handlers for URL-based verification callbacks must work correctly before PDF downloads depend on verification state.

**Delivers:**
- Two-step email verification flow (prevents token prefetching - Pitfall #4)
- Email template configuration in Supabase Dashboard (uses TokenHash pattern)
- Route Handler for /auth/confirm callback
- Server Action to trigger verification email
- Custom error pages for verification failures (expired, invalid tokens)
- "Already verified" state handling with smart routing

**Addresses:** Email verification features from FEATURES.md (table stakes)

**Implements:** Email Verification with TokenHash pattern from ARCHITECTURE.md

**Avoids:** Critical Pitfall #4 (link prefetching), Pitfall #6 (redirect loops), #12 (verification error handling), #13 (cookie SameSite issues)

### Phase 4: Book PDF Download Flow
**Rationale:** Final interactive feature that depends on verified email state from Phase 3. PDF serving requires authentication checks and signed URL generation. This is the riskiest feature architecturally (file serving, auth gates) so it comes last when all infrastructure is proven.

**Delivers:**
- Route Handler for /api/download/[book] with auth checks
- Supabase Storage bucket for private PDFs or Route Handler streaming
- Signed URL generation with 60-second expiry
- Download page for verified users only
- Database logging of download events
- Rate limiting (max 5 downloads per user per day)

**Addresses:** Book PDF download features from FEATURES.md (competitive)

**Implements:** Route Handlers for URL-Based Operations pattern from ARCHITECTURE.md

**Avoids:** Critical Pitfall #8 (PDF serving without auth), performance trap of loading large files into serverless functions

### Phase 5: Navigation Restructure & Content
**Rationale:** Cosmetic changes to navigation and page content can happen after all interactive features work. This phase has lowest technical risk but requires SEO redirects. Deferred to end to avoid interfering with feature development.

**Delivers:**
- Merge Who/What into "Learn" mega dropdown with two columns
- Rename /who to /my-relationships, /what to /my-info
- Create ComingSoonDialog component for disabled features
- Update Header component with new navigation structure
- 301 redirects for all changed URLs (prevents SEO damage)
- Improved responsive layout with tablet/desktop breakpoints
- Updated home page copy ("The Personality Continua")

**Addresses:** Navigation restructure and Coming Soon features from FEATURES.md

**Uses:** Tailwind CSS v4 custom breakpoints from STACK.md

**Avoids:** Pitfall #9 (navigation breaks links and SEO) via proper redirects in next.config.ts

### Phase Ordering Rationale

- **Phase 1 before all others:** Infrastructure must be bulletproof. Getting Supabase clients, RLS, or static/dynamic routes wrong creates cascading failures in every subsequent feature.
- **Phase 2 before Phase 3:** Simple form submission validates Server Actions pattern before adding email verification complexity. Faster feedback loop.
- **Phase 3 before Phase 4:** PDF downloads depend on verified email state. Verification must work correctly first.
- **Phase 4 before Phase 5:** Complete all interactive features before cosmetic navigation changes. Navigation restructure is lowest priority and shouldn't block feature delivery.
- **Grouping by technical dependency:** Phases grouped by what they build on (1=foundation, 2=forms, 3=auth, 4=files, 5=content) rather than by user feature. This matches the architecture's natural layering.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (PDF Download):** Needs specific research on Supabase Storage signed URLs vs. Route Handler streaming for large files. Decision depends on PDF sizes and hosting constraints. Consider file serving performance patterns.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Supabase Foundation):** Official Supabase + Next.js documentation covers all patterns comprehensively. Three-client architecture is well-documented standard.
- **Phase 2 (Email Collection):** react-hook-form + zod + Server Actions is established Next.js 15 pattern with extensive examples.
- **Phase 3 (Email Verification):** Supabase Auth verification flow is documented with official guides. Two-step verification pattern is straightforward.
- **Phase 5 (Navigation):** Standard Next.js routing and Tailwind CSS. No complex patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm (latest stable releases). Official Supabase docs for Next.js 15 App Router integration. Compatibility matrix confirmed. |
| Features | HIGH | Verified across multiple authoritative sources (WebAIM for accessibility, Supabase official docs for auth patterns, NN/G for navigation UX). Community consensus on best practices. |
| Architecture | HIGH | Official Supabase SSR patterns for Next.js 15. Three-client architecture is documented standard. Server Actions vs Route Handlers well-defined use cases. |
| Pitfalls | HIGH | Verified through official Supabase and Next.js documentation, 2026 security standards, real-world issue reports on GitHub discussions, community troubleshooting guides. |

**Overall confidence:** HIGH

The research benefits from official documentation for all core technologies (Next.js 15, Supabase, React 19), recent publication dates (all sources from 2025-2026), and strong community validation. The stack is proven at scale by thousands of production Next.js + Supabase applications. The pitfalls are well-documented with clear prevention strategies.

### Gaps to Address

No significant gaps that block roadmap creation. Minor areas needing validation during implementation:

- **PDF file size limits:** Current research assumes PDFs are <5MB. If PDFs exceed serverless function memory limits, Phase 4 planning should validate Supabase Storage signed URLs (recommended) vs. streaming approaches. Test with actual file sizes before implementation.

- **Email deliverability testing:** SMTP configuration is documented, but actual deliverability depends on domain reputation and provider setup. Plan for email deliverability testing phase before production launch (test with Gmail, Outlook, corporate providers). Consider Resend as recommended provider based on STACK.md research.

- **Static-to-dynamic build testing:** Each phase that touches routes should include `npm run build` verification to catch static/dynamic collisions early. Add to phase testing checklist.

- **RLS policy performance:** Research covers basic RLS patterns but not performance at scale. If queries slow down with >10k rows, Phase 1 should include indexing strategy for RLS policy columns (user_id, email, verified). Add indices preemptively per PITFALLS.md recommendations.

## Sources

### Primary (HIGH confidence)
- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) - Official integration guide
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs) - Official auth integration
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - SSR patterns
- [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) - Three-client architecture
- [react-hook-form Documentation](https://react-hook-form.com/docs/useform) - Official form handling docs
- [Tailwind CSS v4: Theme variables](https://tailwindcss.com/docs/theme) - @theme configuration
- [Next.js: public folder documentation](https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder) - Static file serving
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) - Email verification customization
- [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS patterns

### Secondary (MEDIUM confidence)
- [WebAIM: Usable and Accessible Form Validation](https://webaim.org/techniques/formvalidation/) - Disabled button accessibility
- [Mega Menus Work Well for Site Navigation - NN/G](https://www.nngroup.com/articles/mega-menus-work-well/) - Navigation restructure patterns
- [Supabase Docs | Troubleshooting | OTP Verification Failures](https://supabase.com/docs/guides/troubleshooting/otp-verification-failures-token-has-expired-or-otp_expired-errors-5ee4d0) - Link prefetching issues
- NPM package versions verified for @supabase/supabase-js (2.95.3), @supabase/ssr (0.8.0), react-hook-form (7.71.1), zod (4.3.6), @hookform/resolvers (5.2.2)

### Research Files
- `.planning/research/STACK.md` - Complete stack analysis with versions, alternatives, and integration patterns
- `.planning/research/FEATURES.md` - Feature landscape with table stakes, differentiators, anti-features, and MVP definition
- `.planning/research/ARCHITECTURE.md` - System architecture with patterns, data flows, and component responsibilities
- `.planning/research/PITFALLS.md` - 15 critical and moderate pitfalls with prevention strategies and phase mapping

---
*Research completed: 2026-02-15*
*Ready for roadmap: yes*
