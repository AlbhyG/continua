# Contact Delivery Runbook

## Storage

Contact PDFs live in the private Supabase Storage bucket `books`.

Current files:

- `sampler.pdf` (Continua Book Sampler — goes to everyone)
- `proposal.pdf` (Continua Book Proposal — agents/publishers only)

Current role mapping:

- Agent -> `sampler.pdf` + `proposal.pdf`
- Publisher -> `sampler.pdf` + `proposal.pdf`
- Therapist -> `sampler.pdf`
- Interested Reader -> `sampler.pdf`

Recipients with multiple roles get the union of their files, de-duplicated (e.g. an Agent + Therapist gets the Sampler once plus the Proposal).

If `CONTACT_PDF_STORAGE_PATH` is set, every email request sends that single file instead of using the role mapping.

## PDF Passwords

Delivered PDFs (email attachments and the texted short links) are password-protected. The user password is:

- The recipient's email address, lowercased, when an email is on file.
- The recipient's phone number, digits only with a leading country-code `1` removed (e.g. `+1 (310) 980-2841` -> `3109802841`), for phone-only submissions.

The owner password comes from `PDF_OWNER_PASSWORD`. This password is a social/friction cue, not DRM. Recipients can still forward the PDF and password.

## Texted Short Links (`/d/[token]`)

Phone submissions receive a branded short link per file, e.g. `https://continua.info/d/<token>`, instead of a long Supabase signed URL.

- Each link is a row in the `pdf_links` table (`token`, `file_path`, `user_password`, `label`, `contact_id`). See migration `00015_create_pdf_links.sql`.
- The `/d/[token]` route (`src/app/d/[token]/route.ts`) looks up the token with the service-role client, downloads the file from the private `books` bucket, encrypts it on the fly with the stored `user_password`, and streams it inline as a password-protected PDF.
- Tokens are short, random, and unguessable. Links do not expire; to revoke one, delete its `pdf_links` row.
- `pdf_links` has RLS enabled with no public policies, so only server-side (service-role) code can read or create tokens. The route requires `SUPABASE_SERVICE_ROLE_KEY`.

## Updating A Book PDF (simple system)

The repo ships a one-command uploader: `scripts/upload-book-pdf.mjs`. It uploads
(with overwrite) a local PDF into the private `books` bucket.

One-time setup: add the service role key to `.env.local` (it is gitignored):

```
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard -> Project Settings -> API -> service_role>
```

To update a book, run from the repo root:

```
node scripts/upload-book-pdf.mjs ~/Downloads/new-sampler.pdf  sampler.pdf
node scripts/upload-book-pdf.mjs ~/Downloads/new-proposal.pdf proposal.pdf
```

The second argument is the storage filename the app expects (`sampler.pdf` for
everyone, `proposal.pdf` for agents/publishers). Keep those names stable — they
match `ROLE_PDF_PATHS` in `src/app/actions/get-started.ts`. After uploading,
submit a test Contact Me request for the matching role and confirm the delivered
PDF opens (email password is the lowercase email address; SMS links are signed
and expire in 7 days).

Manual fallback: Supabase dashboard -> Storage -> `books` -> upload with the same
filename.

## Viewing And Exporting Contacts

Open `/admin/contacts`.

The page is protected by `ADMIN_CONTACTS_PASSWORD` and reads data server-side with `SUPABASE_SERVICE_ROLE_KEY`. Do not expose the service role key to browser code.

The table includes delivery log rows and contact rows that do not yet have a delivery. Use the filters for role, status, or text search across name/email/phone.

Use `Copy visible BCC` to copy all visible email addresses as a comma-separated Gmail BCC list. Select rows and use `Copy selected BCC` for a smaller list. Use `Export CSV` to download the currently visible rows.

## Required Env Vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`
- `NOTIFY_EMAIL`
- `PDF_OWNER_PASSWORD`
- `ADMIN_CONTACTS_PASSWORD`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `TWILIO_FROM_NUMBER`

Optional:

- `CONTACT_PDF_STORAGE_PATH`
- `TWILIO_AUTH_TOKEN` can be used instead of API key credentials, but API keys are preferred.

## Delivery Behavior

Email requests download the mapped PDFs from the private `books` bucket, encrypt each PDF, send the attachments through Resend, and log the delivery in `contact_deliveries`.

If a submitter provides a phone number, the server sends low-volume service SMS through Twilio after the contact is saved. The text contains branded short links (`/d/[token]`) to the requested PDFs, served password-protected from the private `books` bucket. The text tells the recipient their password (email address, or phone number for phone-only submissions). Links do not expire.

Email submissions still receive password-protected PDF attachments through Resend. If they also provide a phone number, they receive both the email attachment and the short PDF link by text.

Phone-only submissions receive signed PDF links by text when Twilio is configured and the toll-free sender is approved. If SMS fails or Twilio is unavailable, the request logs `manual_follow_up` and Albhy receives the notification email.

SMS failures are logged to server logs and included in Albhy's notification email when possible. SMS failure does not block email PDF delivery or contact saving.

Delivery logs store Resend provider IDs when available. Logging or notification failures are written to server logs and should not make an already successful PDF email fail for the user.
