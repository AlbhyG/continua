# Contact inquiries — release gate for issue #18

The existing chapter button rename has already shipped. This draft adds the separate general-inquiry form and sends only to `contact@continua.info`, with the visitor's email as Reply-To. It does not call the chapter-delivery action, send PDF attachments, or use the developer notification recipient.

## Required mailbox setup

Albhy confirmed on September 13, 2026 that only `albhy@continua.info` is active. Google Workspace API credentials available to this task lack Directory administration scopes; the Admin console requires reauthentication. No alias was created.

In the Continua domain's Google Admin console, open **Directory → Users → Albhy → User information → Alternate email addresses**, and add `contact` on `continua.info`. An alias delivers to Albhy's existing mailbox without creating another paid user. Verify the alias in the admin console and confirm receipt of a test inquiry before merging this draft, as issue #18 requires.

## Activate after mailbox verification

1. Apply `supabase/migrations/00019_contact_inquiry_rate_limit.sql` to Continua. This is a server-only one-request-per-minute limiter using an HMAC of the Vercel-verified client IP; old buckets expire after a day. It stores no inquiry content or raw address.
2. Set the server-only Vercel production environment variable `CONTACT_INQUIRIES_ENABLED=true`. Existing Resend and Supabase service credentials are reused. Keep it disabled until the recipient is confirmed working.
3. Merge, push main, and run `vercel --prod`.
4. Verify desktop and mobile show both buttons. Verify the first-chapter form is unchanged. Submit a clearly labeled test inquiry and confirm delivery to the alias, Reply-To behavior, no attachment, and that failed sends preserve form values and do not claim success.

Validation includes server-side input limits, a honeypot, rate-limit failure behavior, fixed recipient, and Resend idempotency for retries of unchanged submissions. The feature defaults to unavailable if the activation flag or required backend configuration is missing.

Verified September 13, 2026: TypeScript, production build, and all three `tests/contact-inquiry.spec.ts` tests pass. The rate-limit migration, execute permissions, first-request acceptance, repeat-request denial, and cooldown expiry were tested inside a transaction against Continua and rolled back; the table's absence was confirmed afterward. The migration is not deployed.
