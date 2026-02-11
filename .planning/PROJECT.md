# Continua Website

## What This Is

The informational website for Continua — a personality assessment platform built around the idea that personality traits function on continua rather than as fixed types. The site introduces the product's vision across six personality dimensions (Empathy, Self-Orientation, Social Attunement, Conscientiousness, Agency, Reactivity) and serves as the public-facing marketing shell for individuals, couples, families, and teams.

## Core Value

Visitors understand what Continua is, who it's for, and what it does — clearly enough to want to use it when the product launches.

## Requirements

### Validated

- ✓ Next.js 15 App Router with TypeScript and Tailwind CSS v4 — existing
- ✓ Project scaffolding with build/dev/lint scripts — existing

### Active

- [ ] Home page with branded gradient background and introductory text
- [ ] Fixed header with Continua logo, Who/What/Book dropdowns, and placeholder Sign In button
- [ ] "Who" page describing how Continua works for Individuals, Couples, Families, and Teams
- [ ] "What" page describing Take Assessments, See Results, and Tools & Actions
- [ ] "Book" page with visual-only dialogs for Publishers, Agents, and Therapists
- [ ] Style guide implementation (Inter font, glassmorphism cards, color palette, responsive layout)
- [ ] Dropdown navigation that opens on click, closes on outside click, one open at a time

### Out of Scope

- User accounts and authentication — informational site only, no user system
- Assessment engine — the actual personality tests are a future product build
- Results visualization — no charts, scores, or data display
- Working form submissions — Book dialogs are visual-only for now
- Backend/API — all pages are statically generated
- Dark mode — not in the design system

## Context

There is an existing bare-bones Next.js 15 application with React 19, TypeScript, and Tailwind CSS v4 already configured. The app currently has only a placeholder home page. A detailed architecture document (`docs/web-architecture.md`) specifies page content, navigation behavior, and dropdown interactions. A style guide (`docs/style-guide.md`) defines the full visual system: gradient background, Inter font, glassmorphism cards, navigation pills, responsive breakpoints, and component patterns. A logo exists at `/public/logo.png`.

## Constraints

- **Tech stack**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4 — already established
- **Styling**: Tailwind utilities only, no component library, no icon library
- **Responsive**: Mobile-first with single `md` (768px) breakpoint only
- **Content**: All page text comes from `docs/web-architecture.md` — use it verbatim
- **Design**: Follow `docs/style-guide.md` precisely for colors, typography, spacing, and component patterns

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Informational site only (no product features) | Ship the marketing shell first, build product separately | — Pending |
| Visual-only Book dialogs | Avoid backend dependency; wire up real submissions later | — Pending |
| Placeholder Sign In button | Button present for layout completeness but non-functional | — Pending |
| No hamburger menu on mobile | Style guide specifies horizontal pills at all screen sizes | — Pending |

---
*Last updated: 2026-02-11 after initialization*
