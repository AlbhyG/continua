# Phase 5: Supabase Foundation - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend infrastructure for phases 6-8. Set up Supabase project, database tables (notifications, book_requests), production email delivery via Resend, and session middleware. No UI components — this phase delivers the plumbing.

</domain>

<decisions>
## Implementation Decisions

### Supabase hosting
- Free tier to start (will need Pro upgrade before launch due to 1-week inactivity pausing)
- Cloud-hosted Supabase (not self-hosted)
- US West region
- Project created from scratch — no existing project

### Email provider
- Resend for production SMTP
- Account created from scratch — no existing Resend account
- Custom domain for sending (user owns a domain, DNS records needed)
- Sender address: noreply@[domain]

### Data to capture
- Notification signups: name + email only (minimal friction)
- Book requests: track which specific Book was requested (Publishers, Agents, or Therapists)
- Shared email record — one person who signs up AND requests a Book is a single row, not duplicated
- Track signup date only (verification status is boolean, not timestamped)

### Environment strategy
- Three contexts: Local dev, Vercel preview deploys, Production
- Preview and prod share the same Supabase project (acceptable for pre-launch)
- Secrets via .env.local for local dev + Vercel environment variables for preview/prod
- Site deployed on Vercel (Next.js)

### Claude's Discretion
- Database schema details (column types, indexes, constraints)
- Row Level Security policy design
- JWT middleware implementation approach
- How to handle static vs dynamic route collisions in Next.js

</decisions>

<specifics>
## Specific Ideas

- Free tier pausing is a known concern — plan should note upgrade path to Pro before launch
- Shared data model: one email record serves both notification signup and Book request flows

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-supabase-foundation*
*Context gathered: 2026-02-15*
