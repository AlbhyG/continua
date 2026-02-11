# Requirements: Continua Website

**Defined:** 2026-02-11
**Core Value:** Visitors understand what Continua is, who it's for, and what it does — clearly enough to want to use it when the product launches.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FOUN-01**: Page displays fixed full-viewport gradient background (blue→purple→pink) that stays stationary on scroll
- [ ] **FOUN-02**: All text renders in Inter font loaded via next/font with no layout shift
- [ ] **FOUN-03**: Tailwind CSS v4 theme configured with style guide color tokens (accent, accent-light, border, card, foreground)
- [ ] **FOUN-04**: Content area is centered single column, 375px max on mobile, 720px max at md breakpoint
- [ ] **FOUN-05**: Text on glassmorphic card surfaces meets WCAG 2.1 AA contrast ratio (4.5:1 for body text)

### Header

- [ ] **HEAD-01**: Fixed header stays at top of viewport with backdrop blur, full width, content constrained to 720px
- [ ] **HEAD-02**: Continua logo renders at 72x48px on the left and links to home page
- [ ] **HEAD-03**: Three navigation pills (Who, What, Book) display on the right as pill-shaped buttons with white text
- [ ] **HEAD-04**: Sign In placeholder button displays on the right alongside navigation pills
- [ ] **HEAD-05**: Header does not collapse into hamburger menu on mobile — horizontal pills at all screen sizes

### Navigation

- [ ] **NAV-01**: Clicking a navigation pill opens its dropdown panel below the trigger
- [ ] **NAV-02**: Only one dropdown can be open at a time — opening one closes any other
- [ ] **NAV-03**: Clicking outside an open dropdown closes it
- [ ] **NAV-04**: Dropdown panels have glassmorphic styling (white 95% opacity, rounded-xl, shadow, backdrop blur)
- [ ] **NAV-05**: Dropdown items are clickable and navigate to the appropriate page
- [ ] **NAV-06**: User can navigate dropdowns with keyboard (Tab, Enter, Escape to close)

### Home Page

- [ ] **HOME-01**: Home page displays at the "/" route
- [ ] **HOME-02**: Home page renders the introductory text from the architecture doc (human condition paragraph through six dimensions description)
- [ ] **HOME-03**: Home page uses the style guide type scale (48px/64px heading, 18px/20px body text)

### Who Page

- [ ] **WHO-01**: Who page displays when any Who dropdown item is selected (Individuals, Couples, Families, Teams)
- [ ] **WHO-02**: Who page renders all four audience descriptions verbatim from the architecture doc
- [ ] **WHO-03**: When on the Who page, the Who navigation pill is greyed out in the header
- [ ] **WHO-04**: Who page includes cross-link to What page per architecture doc

### What Page

- [ ] **WHAT-01**: What page displays when any What dropdown item is selected (Take a Test, See Results, Tools and Actions)
- [ ] **WHAT-02**: What page renders all three feature descriptions verbatim from the architecture doc
- [ ] **WHAT-03**: When on the What page, the What navigation pill is greyed out in the header
- [ ] **WHAT-04**: What page includes cross-link to Who page per architecture doc

### Book Page

- [ ] **BOOK-01**: Book dropdown contains three items: Publishers, Agents, Therapists
- [ ] **BOOK-02**: Selecting Publishers opens a dialog saying "We will send you a proposal" with email or phone input
- [ ] **BOOK-03**: Selecting Agents opens a dialog saying "We will send you a proposal" with email or phone input
- [ ] **BOOK-04**: Selecting Therapists opens a dialog saying "We will send you a PDF of the book" with email input
- [ ] **BOOK-05**: All Book dialogs are visual-only — no actual form submission occurs

### SEO

- [ ] **SEO-01**: Each page has unique meta title and description via Next.js Metadata API
- [ ] **SEO-02**: Pages use semantic HTML structure (header, nav, main, section, h1-h3)
- [ ] **SEO-03**: All pages are statically generated at build time
- [ ] **SEO-04**: Inter font loads without layout shift via next/font optimization

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Animations

- **ANIM-01**: Dropdown menus animate open/close with Framer Motion
- **ANIM-02**: Page transitions animate between routes
- **ANIM-03**: Cards and interactive elements have hover micro-animations

### Enhanced Accessibility

- **A11Y-01**: Full screen reader testing and ARIA optimization
- **A11Y-02**: Reduced motion preferences respected via prefers-reduced-motion
- **A11Y-03**: Skip-to-content link for keyboard users

### Working Forms

- **FORM-01**: Book dialogs actually send emails/proposals on submission
- **FORM-02**: Form validation with error states
- **FORM-03**: Success confirmation after form submission

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Informational site only — no user system |
| Assessment engine | Future product build, not part of marketing shell |
| Results visualization | No data, charts, or scores on informational site |
| Dark mode | Not in the design system per style guide |
| Backend / API routes | All pages are statically generated |
| Blog or CMS | Static content from architecture doc, no dynamic content |
| Analytics / tracking | Can be added later without architectural changes |
| Multiple languages / i18n | English only for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | — | Pending |
| FOUN-02 | — | Pending |
| FOUN-03 | — | Pending |
| FOUN-04 | — | Pending |
| FOUN-05 | — | Pending |
| HEAD-01 | — | Pending |
| HEAD-02 | — | Pending |
| HEAD-03 | — | Pending |
| HEAD-04 | — | Pending |
| HEAD-05 | — | Pending |
| NAV-01 | — | Pending |
| NAV-02 | — | Pending |
| NAV-03 | — | Pending |
| NAV-04 | — | Pending |
| NAV-05 | — | Pending |
| NAV-06 | — | Pending |
| HOME-01 | — | Pending |
| HOME-02 | — | Pending |
| HOME-03 | — | Pending |
| WHO-01 | — | Pending |
| WHO-02 | — | Pending |
| WHO-03 | — | Pending |
| WHO-04 | — | Pending |
| WHAT-01 | — | Pending |
| WHAT-02 | — | Pending |
| WHAT-03 | — | Pending |
| WHAT-04 | — | Pending |
| BOOK-01 | — | Pending |
| BOOK-02 | — | Pending |
| BOOK-03 | — | Pending |
| BOOK-04 | — | Pending |
| BOOK-05 | — | Pending |
| SEO-01 | — | Pending |
| SEO-02 | — | Pending |
| SEO-03 | — | Pending |
| SEO-04 | — | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 0
- Unmapped: 36 ⚠️

---
*Requirements defined: 2026-02-11*
*Last updated: 2026-02-11 after initial definition*
