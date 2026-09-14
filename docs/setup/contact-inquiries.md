# Contact inquiries — release gate for issue #18

The existing chapter button rename has already shipped. This draft adds the separate general-inquiry form and sends only to `contact@continua.info`, with the visitor's email as Reply-To. It does not call the chapter-delivery action, send PDF attachments, or use the developer notification recipient.

## Required mailbox setup

The user reported on September 14, 2026 that the `contact@continua.info` alias has been added. The agent did not create it. A clearly labeled message, “Continua release verification — contact alias test,” was accepted by Resend for sending to that alias on September 14. The application API key is send-only and cannot retrieve delivery events, and the available browser has no authenticated Resend dashboard session. Inbox receipt has been requested from the user; it is not yet verified. Do not equate API acceptance with inbox delivery.

The remaining mailbox gate is confirmation that the test reaches Albhy's mailbox (or an authenticated provider delivery event). Confirm receipt before merging this draft, as issue #18 requires. If the alias needs repair, use the Continua domain's Google Admin console under **Directory → Users → Albhy → User information → Alternate email addresses**. An alias delivers to the existing mailbox without creating another paid user.

## Activate after mailbox verification

1. Apply `supabase/migrations/00019_contact_inquiry_rate_limit.sql` to Continua. This is a server-only one-request-per-minute limiter using an HMAC of the Vercel-verified client IP; old buckets expire after a day. It stores no inquiry content or raw address.
2. Set the server-only Vercel production environment variable `CONTACT_INQUIRIES_ENABLED=true`. Existing Resend and Supabase service credentials are reused. Keep it disabled until the recipient is confirmed working.
3. Merge, push main, and run `vercel --prod`.
4. Verify desktop and mobile show both buttons. Verify the first-chapter form is unchanged. Submit a clearly labeled test inquiry and confirm delivery to the alias, Reply-To behavior, no attachment, and that failed sends preserve form values and do not claim success.

Validation includes server-side input limits, a honeypot, rate-limit failure behavior, fixed recipient, and Resend idempotency for retries of unchanged submissions. The feature defaults to unavailable if the activation flag or required backend configuration is missing.

Verified September 13, 2026: TypeScript, production build, and all three `tests/contact-inquiry.spec.ts` tests pass. The rate-limit migration, execute permissions, first-request acceptance, repeat-request denial, and cooldown expiry were tested inside a transaction against Continua and rolled back; the table's absence was confirmed afterward. The migration is not deployed.

Rechecked September 14, 2026: production build passes after merging the latest requirements into this branch; the production limiter table is still absent. A browser check against a local production build with the feature disabled returned the unavailable error and preserved the entered name/message rather than claiming success. Closing the dialog returns to the site; Get the First Chapter opens its independent name/email/phone/opt-in form. This is not a substitute for a live post-activation inquiry and delivery check.
