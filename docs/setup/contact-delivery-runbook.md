# Contact Delivery Runbook

## Storage

Contact PDFs live in the private Supabase Storage bucket `books`.

Current files:

- `agents.pdf`
- `publishers.pdf`
- `therapists.pdf`

Current role mapping:

- Agent -> `agents.pdf`
- Publisher -> `publishers.pdf`
- Therapist -> `therapists.pdf`
- Interested Reader -> `therapists.pdf`

If `CONTACT_PDF_STORAGE_PATH` is set, every email request sends that single file instead of using the role mapping.

## PDF Passwords

Email submissions receive password-protected PDFs. The user password is the recipient email address lowercased. The owner password comes from `PDF_OWNER_PASSWORD`.

This password is a social/friction cue, not DRM. Recipients can still forward the PDF and password.

## Replacing A PDF

1. Open the Supabase project dashboard.
2. Go to Storage -> `books`.
3. Upload the replacement PDF with the same filename, or delete the old object and upload the new one.
4. Submit a test Contact Me request for the matching role and confirm the delivered PDF opens with the lowercase email password.

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

Optional:

- `CONTACT_PDF_STORAGE_PATH`

## Delivery Behavior

Email requests download the mapped PDFs from the private `books` bucket, encrypt each PDF, send the attachments through Resend, and log the delivery in `contact_deliveries`.

Phone-only requests save the contact, log `manual_follow_up`, and send Albhy a notification email. They require manual follow-up unless SMS is added later.

Delivery logs store Resend provider IDs when available. Logging or notification failures are written to server logs and should not make an already successful PDF email fail for the user.
