# Goal: Finish Continua Contact Delivery Admin, Testing, And Albhy Report

You are working in `/Users/shantam/continua`.

Follow the repo instruction in `AGENTS.md`: commit and push after every change. After pushing to `origin main`, run `vercel --prod`.

## Objective

Finish the remaining implementation and verification work that does not require more input from Albhy:

1. End-to-end test the live Contact Me PDF delivery flow yourself, using browser/computer-use where needed.
2. Build an admin contact lookup/export interface so Albhy/Jason can inspect registered contacts, filter by role/status, copy email addresses for Gmail BCC, and export CSV.
3. Harden the Contact Me UX and delivery logging enough for launch use.
4. Document how the system works.
5. Commit, push, deploy.
6. Email Albhy at `albhy@galuten.com` with a concise status report and any remaining questions.

Do not ask Albhy questions before doing this work. Only email him at the end.

## Current State

Known completed work:

- Production site: `https://continua.info`
- GitHub remote: `origin main`
- Resend transactional email is configured:
  - `RESEND_FROM_EMAIL=reply@continua.info`
  - `RESEND_REPLY_TO_EMAIL=albhy@continua.info`
  - `NOTIFY_EMAIL=albhy@continua.info`
- Contact Me form captures role, name, email and/or phone, and consent.
- Contact Me form now sends password-protected PDFs for email submissions.
- PDF password is the recipient lowercase email.
- Existing private Supabase Storage bucket `books` contains:
  - `agents.pdf`
  - `publishers.pdf`
  - `therapists.pdf`
- Current role mapping:
  - Agent -> `agents.pdf`
  - Publisher -> `publishers.pdf`
  - Therapist -> `therapists.pdf`
  - Interested Reader -> `therapists.pdf`
- Supabase migration `00013_create_contact_deliveries.sql` has been applied through the Supabase SQL Editor and verified:
  - `public.contact_deliveries` exists
  - `public.contact_delivery_log` exists
  - `public.upsert_contact_submission` exists
- Recent commits include:
  - `a201bf1 Add password-protected contact PDF delivery`
  - `26db037 Configure transactional email replies`
  - `d7a66ea Fix legacy quiz share links`

Existing dirty/untracked files may be user-owned:

- `.gitignore`
- `TODO-broken-share-link.md`
- `docs/implementation-plan.md`

Do not revert or stage those unless your work explicitly requires changing them.

## Required Work

### 1. Inspect Before Editing

Read the relevant code before modifying:

- `src/components/layout/Header.tsx`
- `src/app/actions/get-started.ts`
- `src/lib/email/send-contact-delivery.ts`
- `src/lib/pdf/encrypt.ts`
- `supabase/migrations/00013_create_contact_deliveries.sql`
- Supabase client helpers under `src/lib/supabase/`
- Existing env examples in `.env.local.example`

Check `git status --short --branch` before edits.

### 2. End-To-End Test Contact Me Flow

Use the live site and/or local dev server plus browser/computer-use to manually test.

Test cases:

- Agent with email
- Publisher with email
- Therapist with email
- Interested Reader with email
- Multiple roles with email
- Phone-only submission
- Missing role
- Missing contact method
- Missing consent

Use a test email address controlled by Jason if available locally/session context. If no real inbox is available, use Resend/Supabase logs to verify send acceptance, but explicitly report that inbox receipt was not verified.

For successful email submissions verify:

- Contact row exists/updates in Supabase.
- `contact_delivery_log` has one row with status `sent`.
- `files_sent` matches expected role mapping.
- Resend accepted the email.
- Generated PDF is encrypted.
- Password is lowercase email.

For phone-only submission verify:

- Contact row is saved.
- Delivery log status is `manual_follow_up`.
- Albhy notification path is triggered or at least code path is verified.

If you use test data in production Supabase, clearly prefix names with `Codex Test` and clean up only if it is safe and obvious. Do not delete real user data.

### 3. Build `/admin/contacts`

Create an admin-only contacts page.

Recommended minimal approach:

- Route: `/admin/contacts`
- Server-rendered page.
- Protect with a simple admin password until Supabase Auth is built.
- Use env var: `ADMIN_CONTACTS_PASSWORD`
- If no valid admin session/password, show a compact password form.
- Store the admin gate in an HTTP-only cookie.
- Use `SUPABASE_SERVICE_ROLE_KEY` server-side for admin reads. Never expose it to the browser.
- Add `.env.local.example` entries:
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  - `ADMIN_CONTACTS_PASSWORD=...`

If `SUPABASE_SERVICE_ROLE_KEY` is not available in local/Vercel env, add the code path and document that the env var is required. Do not weaken RLS to make admin reads work.

Admin UI requirements:

- Show rows from `contact_delivery_log`, plus contacts that may not yet have delivery rows if practical.
- Columns:
  - name
  - email
  - phone
  - roles
  - delivery status
  - files sent
  - sent/created time
  - error, if any
- Filters:
  - role
  - status
  - text search by name/email/phone
- Actions:
  - copy visible emails as comma-separated BCC list
  - copy selected emails if selection is easy to implement
  - export visible rows as CSV

Keep the UI utilitarian and dense. This is an operational admin page, not a marketing page.

### 4. Contact Me UX Cleanup

Improve the dialog as needed:

- Role-required state should be clear.
- Email delivery should mention that the PDF password will be their lowercase email address.
- If a user enters only phone, success copy should make clear Albhy will follow up manually.
- Error messages should be visible and not swallowed.

Do not redesign the whole site.

### 5. Delivery Logging Hardening

Improve delivery tracking if needed:

- Store Resend email IDs in `contact_deliveries` if feasible.
- If a schema change is needed, add a new migration rather than editing an already-applied migration.
- Avoid duplicate delivery rows on accidental double-clicks where reasonably simple.
- Make all logging failures non-destructive: a successful PDF email should not fail only because logging failed.

If you add a migration, apply it to production Supabase before deploying/testing production behavior.

Preferred migration path:

1. Check whether `SUPABASE_DB_PASSWORD` is already present in the shell environment:

   ```bash
   printenv SUPABASE_DB_PASSWORD >/dev/null && echo "SUPABASE_DB_PASSWORD is set"
   ```

2. If it is set, apply migrations with:

   ```bash
   npx supabase db push
   ```

3. If the project is not linked, link it first:

   ```bash
   npx supabase link --project-ref tiyyznmbumlwrugspslc
   npx supabase db push
   ```

Do not print the value of `SUPABASE_DB_PASSWORD`. Do not write it to `.env.local`, `.env`, logs, docs, commits, or any tracked/untracked repo file.

Fallback migration path:

- If `SUPABASE_DB_PASSWORD` is not set or `npx supabase db push` is blocked, use the Supabase SQL Editor through Computer Use and verify the migration afterward.

### 6. Runbook

Create or update a concise runbook, suggested path:

- `docs/setup/contact-delivery-runbook.md`

Include:

- Where PDFs live: Supabase Storage bucket `books`.
- Current PDF filenames and role mapping.
- How password-protected PDFs work.
- How to replace a PDF.
- How to view/export contacts.
- How to copy emails for Gmail BCC.
- Required env vars.
- Known limitations:
  - PDF password is a social/friction cue, not DRM.
  - Forwarded PDFs can still be forwarded with the password.
  - Phone-only requests require manual follow-up unless SMS is added later.

### 7. Verification

Run at minimum:

- `npm run build`
- Any focused scripts/checks you add.
- Manual browser/computer-use test of admin page.
- Manual browser/computer-use test of Contact Me flow.

After deployment, verify:

- `https://continua.info` returns 200.
- `/admin/contacts` is reachable and protected.
- Admin login works with configured password.
- Contact table renders.

### 8. Commit, Push, Deploy

Follow repository policy:

- Commit changes intentionally.
- Push to `origin main`.
- Run `vercel --prod`.
- Verify production after deploy.

In final response, include git directives only for successful actions:

- `::git-stage{cwd="/Users/shantam/continua"}`
- `::git-commit{cwd="/Users/shantam/continua"}`
- `::git-push{cwd="/Users/shantam/continua" branch="main"}`

### 9. Email Albhy At The End

After implementation, testing, commit, push, deploy, send an email to:

- `albhy@galuten.com`

Use the configured Gmail/Workspace tooling if available. If Gmail tooling is unavailable, use the available mail client or ask Jason only if there is no safe way to send.

Subject:

`Continua website update: contact delivery and registration tracking`

Tone:

- Concise
- Factual
- No technical overkill
- Mention what is complete, what was tested, and any decisions/questions left

Draft body should include:

- The Contact Me form now records name, role, email/phone, and consent.
- Email submissions receive password-protected PDFs.
- The password is the recipient's lowercase email address.
- Phone-only submissions are captured for manual follow-up.
- Registrations and delivery status are visible in the admin contact view.
- Albhy/Jason can filter contacts by role/status, copy emails for Gmail BCC, and export CSV.
- Current PDF mapping:
  - agents -> agents PDF
  - publishers -> publishers PDF
  - therapists/readers -> therapists PDF
- Remaining questions:
  1. Should therapists/readers receive the current therapists PDF or a new “advance copy” PDF?
  2. Should agents/publishers receive PDFs directly for now, or should DocSend be added later for analytics/revocation?
  3. Should phone-only users receive SMS later, or is manual follow-up enough for launch?

Do not email Albhy until all feasible work and deployment are complete.

## Final Response To Jason

Summarize:

- What was changed.
- What was tested.
- Production URL.
- Whether Albhy was emailed.
- Any blocked items or remaining decisions.

Keep it concise.
