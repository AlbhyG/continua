# Continua Website

## What This Is

The informational marketing website for Continua — a personality assessment platform built around the idea that personality traits function on continua rather than as fixed types. The site introduces the product's vision across six personality dimensions (Empathy, Self-Orientation, Social Attunement, Conscientiousness, Agency, Reactivity) and serves as the public-facing marketing shell for individuals, couples, families, and teams. Features branded gradient background, glassmorphic UI, accessible dropdown navigation, three content pages, and visual-only booking dialogs.

## Core Value

Visitors understand what Continua is, who it's for, and what it does — clearly enough to want to use it when the product launches.

## Requirements

### Validated

- ✓ Next.js 15 App Router with TypeScript and Tailwind CSS v4 — existing
- ✓ Project scaffolding with build/dev/lint scripts — existing
- ✓ Home page with branded gradient background and introductory text — v1.0
- ✓ Fixed header with Continua logo, Who/What/Book dropdowns, and placeholder Sign In button — v1.0
- ✓ "Who" page describing how Continua works for Individuals, Couples, Families, and Teams — v1.0
- ✓ "What" page describing Take Assessments, See Results, and Tools & Actions — v1.0
- ✓ "Book" page with visual-only dialogs for Publishers, Agents, and Therapists — v1.0
- ✓ Style guide implementation (Inter font, glassmorphism cards, color palette, responsive layout) — v1.0
- ✓ Dropdown navigation that opens on click, closes on outside click, one open at a time — v1.0

### Active

(None — next milestone requirements TBD via `/gsd:new-milestone`)

### Out of Scope

- User accounts and authentication — informational site only, no user system
- Assessment engine — the actual personality tests are a future product build
- Results visualization — no charts, scores, or data display
- Working form submissions — Book dialogs are visual-only for now
- Backend/API — all pages are statically generated
- Dark mode — not in the design system

## Context

Shipped v1.0 with 507 LOC TypeScript/TSX/CSS across 4 phases.
Tech stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, @headlessui/react.
All pages statically generated. No backend dependencies.
Site content sourced from `docs/web-architecture.md` and `docs/style-guide.md`.

## Constraints

- **Tech stack**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4 — established
- **Styling**: Tailwind utilities only, no component library, no icon library
- **Responsive**: Mobile-first with single `md` (768px) breakpoint only
- **Content**: All page text comes from `docs/web-architecture.md` — used verbatim
- **Design**: Follow `docs/style-guide.md` for colors, typography, spacing, and component patterns

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Informational site only (no product features) | Ship marketing shell first, build product separately | ✓ Good — clean separation |
| Visual-only Book dialogs | Avoid backend dependency; wire up real submissions later | ✓ Good — ready for future wiring |
| Placeholder Sign In button | Button present for layout completeness but non-functional | ✓ Good — preserves layout |
| No hamburger menu on mobile | Style guide specifies horizontal pills at all screen sizes | ✓ Good — consistent across breakpoints |
| CSS-based @theme configuration (Tailwind v4) | Eliminates tailwind.config.js, follows v4 best practices | ✓ Good — cleaner config |
| @headlessui/react for dropdowns | Automatic accessibility and keyboard navigation | ✓ Good — zero custom a11y code needed |
| Next.js Metadata API for SEO | Type-safe metadata exports on each page | ✓ Good — statically generated |
| usePathname() for active nav state | Client-side route detection for greyed-out pills | ✓ Good — no server dependency |
| Separate dialog components per Book type | Enable independent future customization | ✓ Good — extensible |

---
*Last updated: 2026-02-11 after v1.0 milestone*
