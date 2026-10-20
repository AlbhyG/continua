# Continua Website

## What This Is

The website for Continua — a personality assessment platform built around the idea that personality traits function on continua rather than as fixed types. The site introduces the product's vision across six personality dimensions (Empathy, Self-Orientation, Social Attunement, Conscientiousness, Agency, Reactivity) and serves as the public-facing entry point for individuals, couples, families, and teams. Features branded gradient background, glassmorphic UI, accessible navigation, content pages, Supabase-backed notification signup, and verified Book PDF downloads with email verification.

## Core Value

Visitors understand what Continua is, who it's for, and what it does — clearly enough to want to use it when the product launches.

## Requirements

### Validated

- ✓ Next.js 15 App Router with TypeScript and Tailwind CSS v4 — existing
- ✓ Project scaffolding with build/dev/lint scripts — existing
- ✓ Home page with branded gradient background and introductory text — v1.0
- ✓ Fixed header with Continua logo, navigation dropdowns, and Sign In button — v1.0
- ✓ Content pages describing Continua for different audiences — v1.0
- ✓ Book dialogs for Publishers, Agents, and Therapists — v1.0
- ✓ Style guide implementation (Inter font, glassmorphism cards, color palette, responsive layout) — v1.0
- ✓ Dropdown navigation that opens on click, closes on outside click, one open at a time — v1.0
- ✓ Supabase backend with database, RLS, and email services — v2.0
- ✓ Combined Learn dropdown with Who/What content and Coming Soon indicators — v2.0
- ✓ Sign In/Up dialog collecting name + email with Zod validation and ARIA accessibility — v2.0
- ✓ Signup data stored in Supabase with RLS protection — v2.0
- ✓ Book dialogs with email verification flow and gated PDF downloads — v2.0
- ✓ Two-step email verification with branded React Email templates — v2.0
- ✓ My Relationships and My Info content pages — v2.0
- ✓ Home page updated with "The Personality Continua" copy — v2.0
- ✓ Responsive tablet and desktop layout — v2.0
- ✓ Old URL redirects (/who, /what) with permanent 308 redirects — v2.0

### Active

(None — next milestone not yet defined)

### Out of Scope

- User accounts and authentication — Sign In/Up is notification signup only, no user sessions
- Assessment engine — the actual personality tests are a future product build
- Results visualization — no charts, scores, or data display
- SMS/phone notifications — email only
- Relationship management features — Add Person/Group dropdowns show "Coming Soon"
- Test-taking features — Take a Test dropdown shows "Coming Soon"
- Dark mode — not in the design system

## Context

Shipped v2.0 with 1,925 LOC TypeScript/TSX/CSS across 9 phases (2 milestones).
Tech stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, @headlessui/react, Supabase (Postgres + RLS), Resend (email), React Email (templates), Zod (validation).
Site content sourced from `docs/web-architecture.md` and the Feb 2026 architecture slides.
Home page aesthetic reference: questionaire-murex.vercel.app (current deployed site).

### Known Tech Debt
- No automated test suite (E2E, integration, or unit tests)
- No error monitoring beyond console.error in Route Handlers
- Email query parameter auth (`?email=X`) is placeholder — replace with session-based auth later
- Unused migration 00002 (RLS UPDATE policy) — harmless

## Constraints

- **Tech stack**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4 — established
- **Backend**: Supabase (Postgres database, RLS policies, Storage buckets) + Resend (email delivery)
- **Styling**: Tailwind utilities only, no component library, no icon library
- **Responsive**: Mobile-first, tablet and PC support required
- **Content**: Page text from architecture doc and slides — used verbatim
- **Design**: Follow `docs/style-guide.md` for colors, typography, spacing, and component patterns

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Informational site only (no product features) | Ship marketing shell first, build product separately | ✓ Good — clean separation |
| No hamburger menu on mobile | Style guide specifies horizontal pills at all screen sizes | ✓ Good — consistent across breakpoints |
| CSS-based @theme configuration (Tailwind v4) | Eliminates tailwind.config.js, follows v4 best practices | ✓ Good — cleaner config |
| @headlessui/react for dropdowns | Automatic accessibility and keyboard navigation | ✓ Good — zero custom a11y code needed |
| Next.js Metadata API for SEO | Type-safe metadata exports on each page | ✓ Good — statically generated |
| Separate dialog components per Book type | Enable independent future customization | ✓ Good — extensible |
| Supabase for backend | Hosted Postgres + email + Storage, quick setup, generous free tier | ✓ Good — shipped in 2 days |
| Email only for v2.0 | Simpler than email + SMS; add SMS channel later | ✓ Good — sufficient for pre-launch |
| Resend for email delivery | Better DX than Supabase built-in email, React Email support | ✓ Good — branded templates working |
| Zod for form validation | Shared schema between client/server, built-in email validator | ✓ Good — single source of truth |
| Insert + unique violation catch (not upsert) | Avoids RLS SELECT policy requirement for signup | ✓ Good — simpler RLS |
| Two-step verification (confirmation page) | Prevents corporate email scanners from consuming tokens | ✓ Good — solved prefetch problem |
| SECURITY DEFINER RPCs for sensitive operations | Bypasses RLS visibility gaps for anon client operations | ✓ Good — secure without service_role key |
| Supabase Storage for PDFs (not filesystem) | Easy updates without repo commits | ✓ Good — swapped real PDFs without deploy |
| Combined Learn dropdown (Who + What) | Simplified navigation, fewer top-level items | ✓ Good — cleaner header |
| Permanent 308 redirects for old URLs | Maintain SEO value from v1.0 links | ✓ Good — no broken links |

---
*Last updated: 2026-02-16 after v2.0 milestone complete*
