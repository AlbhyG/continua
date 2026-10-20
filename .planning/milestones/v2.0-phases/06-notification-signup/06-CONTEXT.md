# Phase 6: Notification Signup - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can sign up for launch notifications by providing their name and email via a dialog triggered from the header. The form validates inline, persists data to the database, and shows a "check your email" confirmation. Verification flow, PDF downloads, and navigation restructure are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Dialog trigger & form layout
- Sign In/Up button in header uses **primary/filled style** — stands out as a call to action
- Form collects two fields: **Name** (single field, not first/last split) and **Email**
- Clicking the button opens a dialog (exact type — modal vs slide-in — is Claude's discretion)

### Validation & error display
- Validation triggers **on blur** (when user leaves a field)
- Error messages appear **below each field** (inline, not summary)
- Error text only — no red border or visual field indicator beyond the message
- Submit button is **disabled until all fields are valid**
- ARIA live regions announce errors for screen readers (per success criteria)

### Post-submission flow
- On successful submit, the dialog **replaces the form with a confirmation message** (same dialog stays open)
- Confirmation message: **"Check your email"** — directs them to verify
- No resend option — keep it simple
- Dialog closes only via **manual close** (X button or click outside) — no auto-close

### Returning visitor handling
- Duplicate email submissions show the **same "check your email" confirmation** — don't reveal whether the email already exists (privacy-safe)
- How to handle a returning user who clicks the button is Claude's discretion (session/cookie detection vs always showing form)
- After sign-in (post-verification), the header button **changes to show the user's name**
- Clicking the name shows a **simple dropdown with their email and a Sign Out option**

### Claude's Discretion
- Dialog type (modal overlay vs slide-in panel)
- Form layout and spacing
- Exact confirmation message copy and any illustration/icon
- Returning user detection approach (session-based vs always show form and catch at submit)
- Loading/submitting state indicator on the form

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-notification-signup*
*Context gathered: 2026-02-15*
