# Roadmap: Continua Website

## Overview

Build the informational marketing website for Continua's personality assessment platform in four focused phases. Start with foundation (gradient background, Inter font, header structure, Tailwind configuration), add interactive navigation (dropdowns with accessibility), deliver all content pages (Home, Who, What) with SEO, and finish with Book dialogs for lead capture. Each phase delivers verifiable user-facing capabilities that build toward the core value: visitors understand what Continua is, who it's for, and what it does.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Layout** - Gradient background, Inter font, header structure, home route ✓ 2026-02-11
- [x] **Phase 2: Interactive Navigation** - Dropdown menus with accessibility and keyboard support ✓ 2026-02-11
- [x] **Phase 3: Content Pages & SEO** - Home, Who, What pages with semantic HTML and metadata ✓ 2026-02-11
- [ ] **Phase 4: Book Dialogs** - Modal forms for Publishers, Agents, Therapists (visual-only)

## Phase Details

### Phase 1: Foundation & Layout
**Goal**: Visitor sees branded Continua site with fixed header, gradient background, and working home route
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, HEAD-01, HEAD-02, HEAD-03, HEAD-04, HEAD-05, HOME-01
**Success Criteria** (what must be TRUE):
  1. Page displays full-viewport gradient background (blue→purple→pink) that stays stationary when scrolling
  2. All text renders in Inter font with no layout shift during load
  3. Fixed header with Continua logo and navigation pills stays at top of viewport on all pages
  4. Content area centers at 375px max on mobile and 720px max at desktop breakpoint
  5. Home page displays at "/" route and header doesn't collapse into hamburger menu on mobile
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Install Tailwind CSS v4, configure theme tokens, gradient background, Inter font
- [x] 01-02-PLAN.md — Build fixed header with logo and nav pills, set up home page content area

### Phase 2: Interactive Navigation
**Goal**: Visitor can navigate between pages using accessible dropdown menus with full keyboard support
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06
**Success Criteria** (what must be TRUE):
  1. Clicking a navigation pill opens its dropdown panel below the trigger
  2. Opening one dropdown closes any other that's already open
  3. Clicking outside an open dropdown closes it
  4. Dropdown panels display with glassmorphic styling and items navigate to appropriate pages
  5. User can navigate dropdowns entirely with keyboard (Tab, Enter, Escape to close)
**Plans:** 1 plan

Plans:
- [x] 02-01-PLAN.md — Install @headlessui/react and implement dropdown menus for Who, What, Book with glassmorphic styling and keyboard accessibility

### Phase 3: Content Pages & SEO
**Goal**: Visitor reads complete content for Home, Who, and What pages with proper SEO and cross-linking
**Depends on**: Phase 2
**Requirements**: HOME-02, HOME-03, WHO-01, WHO-02, WHO-03, WHO-04, WHAT-01, WHAT-02, WHAT-03, WHAT-04, SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. Home page renders introductory text with 48px heading and 18px body text per style guide
  2. Who page displays all four audience descriptions (Individuals, Couples, Families, Teams) and greys out Who pill in header
  3. What page displays all three feature descriptions (Take a Test, See Results, Tools and Actions) and greys out What pill in header
  4. Who and What pages include cross-links to each other as specified in architecture doc
  5. Each page has unique meta title and description, uses semantic HTML, and is statically generated at build time
**Plans:** 2 plans

Plans:
- [x] 03-01-PLAN.md — Create Home, Who, What content pages with verbatim text, SEO metadata, typography, and cross-links
- [x] 03-02-PLAN.md — Add active navigation state to Header (greyed-out pills on current page) and verify static build

### Phase 4: Book Dialogs
**Goal**: Visitor can open Book dialogs for Publishers, Agents, or Therapists and see visual-only forms
**Depends on**: Phase 3
**Requirements**: BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05
**Success Criteria** (what must be TRUE):
  1. Book dropdown contains three items: Publishers, Agents, Therapists
  2. Selecting Publishers opens dialog saying "We will send you a proposal" with email or phone input
  3. Selecting Agents opens dialog saying "We will send you a proposal" with email or phone input
  4. Selecting Therapists opens dialog saying "We will send you a PDF of the book" with email input
  5. All Book dialogs are visual-only with no actual form submission
**Plans**: TBD

Plans:
- [ ] (Plans created during planning phase)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Layout | 2/2 | ✓ Complete | 2026-02-11 |
| 2. Interactive Navigation | 1/1 | ✓ Complete | 2026-02-11 |
| 3. Content Pages & SEO | 2/2 | ✓ Complete | 2026-02-11 |
| 4. Book Dialogs | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-11 after Phase 3 execution complete*
