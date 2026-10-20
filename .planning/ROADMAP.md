# Roadmap: Continua Website

## Overview

Two milestones shipped: v1.0 (static marketing site) and v2.0 (interactive pre-launch platform with Supabase backend). The site now captures verified leads through notification signup and gated Book PDF downloads.

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-02-11)
- ✅ **v2.0 Interactive Foundation** — Phases 5-9 (shipped 2026-02-16)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-02-11</summary>

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

<details>
<summary>✅ v2.0 Interactive Foundation (Phases 5-9) — SHIPPED 2026-02-16</summary>

### Phase 5: Supabase Foundation
**Goal**: Backend infrastructure with database, authentication, and email services
**Plans**: 2 plans

Plans:
- [x] 05-01: Supabase/Resend client utilities for browser, server, and middleware
- [x] 05-02: Database migration SQL with RLS, Next.js middleware, user account setup

### Phase 6: Notification Signup
**Goal**: Users can sign up for launch notifications with validated email addresses
**Plans**: 2 plans

Plans:
- [x] 06-01: Zod validation schema, Server Action for signup, RLS policies
- [x] 06-02: SignupDialog with on-blur validation and ARIA errors, Header wiring

### Phase 7: Email Verification Flow
**Goal**: Users verify email addresses through two-step confirmation before accessing gated content
**Plans**: 2 plans

Plans:
- [x] 07-01: Database migration, token generation, React Email template, send-verification function
- [x] 07-02: Server Actions (request-verification + verify-email), two-step verification page, Book dialog wiring

### Phase 8: Book PDF Downloads
**Goal**: Verified users can download Book PDFs for Publishers, Agents, and Therapists
**Plans**: 2 plans

Plans:
- [x] 08-01: Database migration (book_downloads table, RPC update), authenticated Route Handler, placeholder PDFs
- [x] 08-02: Verification success download link, Agents/Therapists dialog forms

### Phase 9: Navigation & Content Restructure
**Goal**: Restructured navigation with new content pages and Coming Soon indicators
**Plans**: 2 plans

Plans:
- [x] 09-01: Learn dropdown with Coming Soon items, URL redirects, home page copy update
- [x] 09-02: My Relationships and My Info content pages, responsive layout optimization

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Layout | v1.0 | 2/2 | Complete | 2026-02-11 |
| 2. Interactive Navigation | v1.0 | 1/1 | Complete | 2026-02-11 |
| 3. Content Pages & SEO | v1.0 | 2/2 | Complete | 2026-02-11 |
| 4. Book Dialogs | v1.0 | 1/1 | Complete | 2026-02-11 |
| 5. Supabase Foundation | v2.0 | 2/2 | Complete | 2026-02-16 |
| 6. Notification Signup | v2.0 | 2/2 | Complete | 2026-02-16 |
| 7. Email Verification Flow | v2.0 | 2/2 | Complete | 2026-02-16 |
| 8. Book PDF Downloads | v2.0 | 2/2 | Complete | 2026-02-16 |
| 9. Navigation & Content Restructure | v2.0 | 2/2 | Complete | 2026-02-16 |

---
*Roadmap created: 2026-02-11 for v1.0*
*Last updated: 2026-02-16 after v2.0 milestone complete*
