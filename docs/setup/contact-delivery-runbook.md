# Contact Delivery Runbook

## Storage

Contact PDFs live in the private Supabase Storage bucket `books`.

Every current request receives `first-chapter-2026-08-30.pdf`, or the single
filename configured by `CONTACT_PDF_STORAGE_PATH`. Email, SMS, and legacy email
verification share this setting. Role-based sampler/proposal delivery is retired.
`first-chapter.pdf`, `sampler.pdf`, and `proposal.pdf` remain stored for historical
links; they are not the default for new requests.

The full manuscript is stored separately in the private `manuscripts` bucket.
See [retrieval instructions](../manuscript/README.md). Do not upload it as a
website chapter or commit it to the public repository.

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

Legacy `/verify/<token>` pages issue a `/d/<token>` link only after successful
email verification. The older `/api/download/<bookType>?email=...` bookmarks
redirect to the homepage to request a chapter; an email address alone is not
authorization. No full manuscript is exposed by either route.

The repo ships a one-command uploader: `scripts/upload-book-pdf.mjs`. It uploads
(with overwrite) a local PDF into the private `books` bucket.

One-time setup: add the service role key to `.env.local` (it is gitignored):

```
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard -> Project Settings -> API -> service_role>
```

To update a book, run from the repo root:

```
node scripts/upload-book-pdf.mjs ~/Downloads/first-chapter.pdf first-chapter-2026-08-30.pdf
```

The second argument must match `CONTACT_PDF_STORAGE_PATH`, or its default
`first-chapter-2026-08-30.pdf`. Confirm delivery using an authorized test recipient.
Email passwords are lowercase email addresses. SMS links are database-backed
tokens and do not expire automatically; delete a link's row to revoke it.

Manual fallback: Supabase dashboard -> Storage -> `books` -> upload with the same
filename.

## Viewing And Exporting Contacts

Open `/admin/contacts`.

Access requires signing in to Continua with an account listed in the `admin_users` table (see `supabase/migrations/00021_add_admin_users.sql`; seed admins by email after applying it). The page reads data server-side with `SUPABASE_SERVICE_ROLE_KEY`. Do not expose the service role key to browser code.

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
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `TWILIO_FROM_NUMBER`

Optional:

- `CONTACT_PDF_STORAGE_PATH`
- `TWILIO_AUTH_TOKEN` can be used instead of API key credentials, but API keys are preferred.

## Delivery Behavior

Email requests download the configured first-chapter PDF from the private `books` bucket, encrypt it, send the attachment through Resend, and log the delivery in `contact_deliveries`.

If a submitter provides a phone number, the server sends low-volume service SMS through Twilio after the contact is saved. The text contains branded short links (`/d/[token]`) to the requested PDFs, served password-protected from the private `books` bucket. The text tells the recipient their password (email address, or phone number for phone-only submissions). Links do not expire.

Email submissions still receive password-protected PDF attachments through Resend. If they also provide a phone number, they receive both the email attachment and the short PDF link by text.

Phone-only submissions receive token-based PDF links by text when Twilio is configured and the toll-free sender is approved. If SMS fails or Twilio is unavailable, the request logs `manual_follow_up` and Albhy receives the notification email.

SMS failures are logged to server logs and included in Albhy's notification email when possible. SMS failure does not block email PDF delivery or contact saving.

Delivery logs store Resend provider IDs when available. Logging or notification failures are written to server logs and should not make an already successful PDF email fail for the user.
