# Continua Website

## What This Is

The website for Continua — a personality assessment platform built around the idea that personality traits function on continua rather than as fixed types. The site introduces the product's vision across six personality dimensions (Empathy, Self-Orientation, Social Attunement, Conscientiousness, Agency, Reactivity) and serves as the public-facing entry point for individuals, couples, families, and teams. Features branded gradient background, glassmorphic UI, accessible navigation, content pages with interactive placeholders, and a Supabase-backed notification signup and verified Book download flow.

## Core Value

Visitors understand what Continua is, who it's for, and what it does — clearly enough to want to use it when the product launches.

## Current Milestone: v2.0 Interactive Foundation

**Goal:** Evolve from static marketing shell to interactive site with backend — restructured navigation, new content pages, notification signup, and verified Book PDF downloads via Supabase.

**Target features:**
- Restructured navigation (Who/What combined dropdown, functional Sign In/Up)
- My Relationships page with content and Coming Soon placeholder dropdowns
- My Info page with content and Coming Soon placeholder dropdowns
- Sign In/Up dialog collecting name + email, stored in Supabase
- Book dialogs with email verification flow and PDF downloads
- Updated home page copy
- Improved tablet/PC responsive layout

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

### Active

- Restructured header: Who/What combined dropdown, The Book dropdown, Sign In/Up button
- Home page updated with new copy ("The Personality Continua")
- My Relationships page with slide 1 content and Coming Soon dropdowns (Add, My Projects)
- My Info page with slide 2 content and Coming Soon dropdowns (Take a Test, My Results)
- Sign In/Up dialog: collects name + email, stores in Supabase, validates before enabling OK
- Book dialogs: collect email → send verification link → verified PDF download
- Supabase integration (database, email sending)
- Improved responsive layout for tablet and PC

### Out of Scope

- User accounts and authentication — Sign In/Up is notification signup only, no user sessions
- Assessment engine — the actual personality tests are a future product build
- Results visualization — no charts, scores, or data display
- SMS/phone notifications — email only for v2.0
- Relationship management features — Add Person/Group dropdowns show "Coming Soon"
- Test-taking features — Take a Test dropdown shows "Coming Soon"
- Dark mode — not in the design system

## Context

Shipped v1.0 with 507 LOC TypeScript/TSX/CSS across 4 phases.
Tech stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, @headlessui/react.
Adding Supabase for v2.0 (database + email).
Site content sourced from `docs/web-architecture.md` and the Feb 2026 architecture slides.
Home page aesthetic reference: questionaire-murex.vercel.app (current deployed site).

## Constraints

- **Tech stack**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4 — established
- **Backend**: Supabase (Postgres database, email via Supabase or Resend)
- **Styling**: Tailwind utilities only, no component library, no icon library
- **Responsive**: Mobile-first, tablet and PC support required
- **Content**: Page text from architecture doc and slides — used verbatim
- **Design**: Follow `docs/style-guide.md` for colors, typography, spacing, and component patterns
- **PDFs**: Placeholder files for Book downloads (real PDFs provided later)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Informational site only (no product features) | Ship marketing shell first, build product separately | ✓ Good — clean separation |
| Visual-only Book dialogs | Avoid backend dependency; wire up real submissions later | ✓ Good — ready for future wiring |
| No hamburger menu on mobile | Style guide specifies horizontal pills at all screen sizes | ✓ Good — consistent across breakpoints |
| CSS-based @theme configuration (Tailwind v4) | Eliminates tailwind.config.js, follows v4 best practices | ✓ Good — cleaner config |
| @headlessui/react for dropdowns | Automatic accessibility and keyboard navigation | ✓ Good — zero custom a11y code needed |
| Next.js Metadata API for SEO | Type-safe metadata exports on each page | ✓ Good — statically generated |
| Separate dialog components per Book type | Enable independent future customization | ✓ Good — extensible |
| Supabase for backend | Hosted Postgres + email + Edge Functions, quick setup, generous free tier | — Pending |
| Email only for v2.0 | Simpler than email + SMS; add SMS channel later | — Pending |
| Placeholder PDFs for Book downloads | Wire up full verification flow now, swap real PDFs later | — Pending |

---
*Last updated: 2026-02-15 after v2.0 milestone started*
