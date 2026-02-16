# Requirements: Continua Website

**Defined:** 2026-02-15
**Core Value:** Visitors understand what Continua is, who it's for, and what it does — clearly enough to want to use it when the product launches.

## v2.0 Requirements

Requirements for v2.0 Interactive Foundation. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Supabase backend configured with database, authentication, and email services
- [ ] **INFRA-02**: Database tables with Row Level Security policies for data protection
- [ ] **INFRA-03**: Production email delivery via custom SMTP provider

### Navigation

- [ ] **NAV-01**: User sees combined Who/What dropdown in header with all audience and offering sections
- [ ] **NAV-02**: User sees Coming Soon indicators for Add, My Projects, Take a Test, and My Results
- [ ] **NAV-03**: User can click Sign In/Up button in header to open signup dialog
- [ ] **NAV-04**: User visiting old URLs (/who, /what) is redirected to new pages

### Content

- [ ] **CONT-01**: User can view My Relationships page with relationship-focused content
- [ ] **CONT-02**: User can view My Info page with self-assessment-focused content
- [ ] **CONT-03**: Home page displays updated copy ("The Personality Continua")
- [ ] **CONT-04**: Site layout is optimized for tablet and desktop screen sizes

### Signup

- [ ] **SIGN-01**: User can enter name and email in Sign In/Up dialog
- [ ] **SIGN-02**: User sees inline validation errors for invalid input
- [ ] **SIGN-03**: User with screen reader receives accessible error announcements
- [ ] **SIGN-04**: User's signup data is stored in database
- [ ] **SIGN-05**: User sees "check your email" confirmation after successful signup

### Book Downloads

- [ ] **BOOK-01**: User can request Book PDF from Publishers, Agents, or Therapists dialog
- [ ] **BOOK-02**: User receives verification email after requesting a Book
- [ ] **BOOK-03**: User clicking verification link lands on confirmation page (two-step flow)
- [ ] **BOOK-04**: User can download PDF after email verification
- [ ] **BOOK-05**: User with expired/invalid verification link sees clear error with guidance
- [ ] **BOOK-06**: Verification emails use branded templates

## Future Requirements

Deferred to v2.x or later. Tracked but not in current roadmap.

### Enhanced UX

- **UX-01**: User can resend verification email if not received
- **UX-02**: User sees clear message when clicking expired verification link with re-send option
- **UX-03**: User can change email address before verification
- **UX-04**: User sees loading spinners during async operations
- **UX-05**: User sees toast notifications for success/error feedback

### Growth

- **GROW-01**: User sees waitlist position after signup
- **GROW-02**: User can join per-feature waitlists from Coming Soon dropdowns

### Platform

- **PLAT-01**: SMS notification channel alongside email
- **PLAT-02**: User account system with persistent sessions
- **PLAT-03**: Social login (Google, Apple)
- **PLAT-04**: Admin dashboard for waitlist management

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts and authentication | Sign In/Up is notification signup only, no user sessions |
| Assessment engine | Personality tests are a future product build |
| Results visualization | No charts, scores, or data display |
| SMS/phone notifications | Email only for v2.0; add SMS channel later |
| Relationship management features | Add Person/Group show "Coming Soon" only |
| Test-taking features | Take a Test shows "Coming Soon" only |
| Dark mode | Not in the design system |
| Disabled submit button pattern | Accessibility anti-pattern per research; use enabled button with inline errors |
| Password-based authentication | Magic links simpler for pre-launch notification signup |
| Social login | Defer until converting to full user accounts |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | — | Pending |
| INFRA-02 | — | Pending |
| INFRA-03 | — | Pending |
| NAV-01 | — | Pending |
| NAV-02 | — | Pending |
| NAV-03 | — | Pending |
| NAV-04 | — | Pending |
| CONT-01 | — | Pending |
| CONT-02 | — | Pending |
| CONT-03 | — | Pending |
| CONT-04 | — | Pending |
| SIGN-01 | — | Pending |
| SIGN-02 | — | Pending |
| SIGN-03 | — | Pending |
| SIGN-04 | — | Pending |
| SIGN-05 | — | Pending |
| BOOK-01 | — | Pending |
| BOOK-02 | — | Pending |
| BOOK-03 | — | Pending |
| BOOK-04 | — | Pending |
| BOOK-05 | — | Pending |
| BOOK-06 | — | Pending |

**Coverage:**
- v2.0 requirements: 22 total
- Mapped to phases: 0
- Unmapped: 22

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after initial definition*
