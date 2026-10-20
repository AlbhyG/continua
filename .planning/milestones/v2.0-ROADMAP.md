# Roadmap: Continua Website

## Overview

v2.0 evolves the static marketing site into an interactive pre-launch platform with backend integration. Five phases deliver Supabase foundation, notification signup, email verification, gated PDF downloads, and restructured navigation — transforming visitor interest into verified leads ready for product launch.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-02-11)
- 🚧 **v2.0 Interactive Foundation** - Phases 5-9 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>✅ v1.0 MVP (Phases 1-4) - SHIPPED 2026-02-11</summary>

### Phase 1: Foundation & Layout
**Goal**: Branded visual foundation with gradient background and design system
**Plans**: 2 plans

Plans:
- [x] 01-01: Tailwind CSS v4 setup with theme variables
- [x] 01-02: Gradient background and style guide implementation

### Phase 2: Interactive Navigation
**Goal**: Fixed header with accessible dropdown navigation
**Plans**: 1 plan

Plans:
- [x] 02-01: Header component with dropdowns and navigation state

### Phase 3: Content Pages & SEO
**Goal**: Content pages describing Continua for different audiences
**Plans**: 2 plans

Plans:
- [x] 03-01: Home page with core messaging
- [x] 03-02: Who/What pages with SEO metadata

### Phase 4: Book Dialogs
**Goal**: Visual-only Book dialogs ready for future backend integration
**Plans**: 1 plan

Plans:
- [x] 04-01: Publishers/Agents/Therapists Book dialogs

</details>

### 🚧 v2.0 Interactive Foundation (In Progress)

**Milestone Goal:** Evolve from static marketing shell to interactive site with backend — restructured navigation, new content pages, notification signup, and verified Book PDF downloads via Supabase.

#### Phase 5: Supabase Foundation
**Goal**: Backend infrastructure with database, authentication, and email services
**Depends on**: Phase 4 (v1.0 completion)
**Requirements**: INFRA-01, INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. Supabase project exists with environment variables configured for all three execution contexts
  2. Database tables (notifications, book_requests) exist with Row Level Security enabled
  3. Production email delivery works via custom SMTP provider
  4. All existing static routes remain static (no build errors from dynamic collisions)
  5. Session refresh middleware validates JWT signatures on every request
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Install Supabase/Resend packages and create client utilities for browser, server, and middleware contexts
- [x] 05-02-PLAN.md — Database migration SQL with RLS, Next.js middleware, and user account setup checkpoint

#### Phase 6: Notification Signup
**Goal**: Users can sign up for launch notifications with validated email addresses
**Depends on**: Phase 5
**Requirements**: SIGN-01, SIGN-02, SIGN-03, SIGN-04, SIGN-05, NAV-03
**Success Criteria** (what must be TRUE):
  1. User can open Sign In/Up dialog from header button
  2. User sees inline validation errors for invalid name or email without page reload
  3. User with screen reader hears error announcements via ARIA live regions
  4. User's signup data persists in database after form submission
  5. User sees "check your email" confirmation message after successful signup
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md — Install Zod, create shared validation schema, Server Action for signup upsert, RLS UPDATE policy
- [x] 06-02-PLAN.md — SignupDialog component with on-blur validation and ARIA errors, wire Header button, end-to-end verification

#### Phase 7: Email Verification Flow
**Goal**: Users verify email addresses through two-step confirmation before accessing gated content
**Depends on**: Phase 6
**Requirements**: BOOK-02, BOOK-03, BOOK-05, BOOK-06
**Success Criteria** (what must be TRUE):
  1. User receives branded verification email after requesting Book download
  2. User clicking verification link lands on confirmation page (not direct download)
  3. User can complete verification by clicking button on confirmation page
  4. User with expired verification link sees clear error message with re-request guidance
  5. Verification tokens survive email link prefetching (corporate security scanners don't consume them)
**Plans**: 2 plans

Plans:
- [ ] 07-01-PLAN.md — Database migration, token generation utility, React Email template, and send-verification email function
- [ ] 07-02-PLAN.md — Server Actions (request-verification + verify-email), two-step verification page, Book dialog wiring, end-to-end checkpoint

#### Phase 8: Book PDF Downloads
**Goal**: Verified users can download Book PDFs for Publishers, Agents, and Therapists
**Depends on**: Phase 7
**Requirements**: BOOK-01, BOOK-04
**Success Criteria** (what must be TRUE):
  1. User with verified email can download requested Book PDF
  2. User without verified email cannot access PDF download URLs (authentication gate works)
  3. Book download requests are logged to database for analytics
  4. PDF files are served securely (not directly accessible from /public/)
**Plans**: 2 plans

Plans:
- [ ] 08-01-PLAN.md — Database migration (book_downloads table, RPC update), authenticated Route Handler, and placeholder PDFs
- [ ] 08-02-PLAN.md — Verification success download link, Agents/Therapists dialog forms, end-to-end verification

#### Phase 9: Navigation & Content Restructure
**Goal**: Restructured navigation with new content pages and Coming Soon indicators
**Depends on**: Phase 8
**Requirements**: NAV-01, NAV-02, NAV-04, CONT-01, CONT-02, CONT-03, CONT-04
**Success Criteria** (what must be TRUE):
  1. User sees combined Who/What dropdown in header (Learn section)
  2. User can navigate to My Relationships page with relationship-focused content
  3. User can navigate to My Info page with self-assessment content
  4. User sees Coming Soon indicators for Add, My Projects, Take a Test, My Results features
  5. User visiting old URLs (/who, /what) is redirected to new pages without 404 errors
  6. Site layout renders correctly on tablet (768px) and desktop (1024px+) screen sizes
  7. Home page displays updated copy "The Personality Continua"
**Plans**: 2 plans

Plans:
- [ ] 09-01-PLAN.md — Learn dropdown with Coming Soon items, URL redirects, home page copy update
- [ ] 09-02-PLAN.md — My Relationships and My Info content pages, responsive layout optimization

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7 → 8 → 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Layout | v1.0 | 2/2 | Complete | 2026-02-11 |
| 2. Interactive Navigation | v1.0 | 1/1 | Complete | 2026-02-11 |
| 3. Content Pages & SEO | v1.0 | 2/2 | Complete | 2026-02-11 |
| 4. Book Dialogs | v1.0 | 1/1 | Complete | 2026-02-11 |
| 5. Supabase Foundation | v2.0 | 2/2 | Complete | 2026-02-16 |
| 6. Notification Signup | v2.0 | 2/2 | Complete | 2026-02-16 |
| 7. Email Verification Flow | v2.0 | 0/0 | Not started | - |
| 8. Book PDF Downloads | v2.0 | 0/0 | Not started | - |
| 9. Navigation & Content Restructure | v2.0 | 0/0 | Not started | - |

---
*Roadmap created: 2026-02-11 for v1.0*
*Last updated: 2026-02-16 after Phase 9 planned*
