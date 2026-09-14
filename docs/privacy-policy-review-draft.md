# Privacy policy review draft and data inventory

Prepared September 14, 2026. **Internal working draft, not an effective policy or legal approval.** This document is not routed into the website. The current public privacy policy has not been replaced. Review actual infrastructure, provider terms, operational procedures, and applicable law before approving any promises below.

## Why a revision is needed

The current public page says collection is limited to contact details and excludes sensitive personal data. The app already stores assessment scores, people/group records, delivery metadata, and browser identifiers. Proposed context notes and two-person comparisons will expand that inventory further. The policy should describe what is actually collected and used rather than retain the contact-only framing.

Code review is not proof of production retention, provider contracts, deletion completion, or legal compliance. No real assessment or contact content was queried for this inventory.

## Current implementation inventory

| Data / purpose | Where and access boundary | Retention or deletion evidence / review needed |
|---|---|---|
| Account identity, sessions, email sign-in, passkey credential records | Supabase Auth; client/server auth helpers and `my-info/passkey-settings.tsx` | Passkey removal exists. Verify provider retention, session termination, and complete account-erasure procedure before claiming account closure erases all data. |
| Name, email, optional phone, interest roles, email verification state | `contacts`; contact/book server actions and admin interface | Stored in Supabase. Review retention for unverified/inactive contacts and historical requests. |
| Book requests/download records, delivery recipient, files, provider IDs, failure status and password identifier | `book_requests`, `book_downloads`, `contact_deliveries`; migrations and delivery actions | Contact foreign-key cascades cover some rows, not necessarily every artifact. Retention and logs need an explicit schedule. Do not publish operational secret values. |
| PDF link token, file mapping, password identifier | `pdf_links`, private `books` storage, server download route | Current short links have no automatic expiry. Migration has no contact foreign-key cascade; explicitly audit removal on contact/account erasure. PDFs already downloaded cannot be recalled. |
| Assessment responses in transit; computed scores, questionnaire ID, timestamps, account/person linkage and anonymous token in storage | `quiz/api/submit`, `lib/quiz/db.ts`, `quiz_results`, `quiz_users` | Submit receives answer vectors but the reviewed storage function persists scores, not individual answers. My Info deletes owned assessment rows. No comprehensive expiry/account-erasure proof was established. |
| People’s names, self/non-self designation, groups and memberships | `people`, `groups`, `group_members`; account ownership rules and relationship actions | Existing users can enter records about other people. Confirm notice, permitted uses, consent expectations, and deletion coverage separately from future mutual-consent comparisons. |
| Individual-result share payload | Score data encoded in a signed URL; `lib/quiz/share.ts`, `quiz/api/share-verify` | Encoding is not encryption. A recipient can read the payload; the current link does not consult an expiring/revocable DB grant. Deleting a saved assessment does not itself revoke the encoded shared copy. Scope logs/referrers/browser history in the inventory. |
| Browser continuity/storage | Anonymous token in localStorage and a one-year cookie from quiz landing; result objects in sessionStorage; authentication cookies | Explain both cookies and local/session storage. Determine clearing on logout/deletion and shared-device behavior; “anonymous” token is a persistent identifier, not proof of anonymity. |
| Operational hosting/auth/email/SMS metadata | Vercel, Supabase, Resend, Twilio where configured; existing code and runbooks | Verify actual enabled services, logging/redaction, regions, processor contracts, retention, and access roles. Code presence is not proof every provider is active. |

### Contact-form release inventory

The separate inquiry form sends name, visitor email (Reply-To), and message through Resend to `contact@continua.info`, which the user reports is an alias for Albhy's mailbox. The application does not add inquiry content to the contacts table, but Resend and the receiving mailbox process/store the email. Include both in retention and deletion procedures. The recipient is fixed in code; it is not visitor-selectable.

Its rate limiter stores a keyed hash of the edge-provided IP, a request UUID, and last-attempt timestamp. Cleanup removes buckets older than a day **when another inquiry calls the function**—not on a guaranteed 24-hour timer. Do not promise deletion within exactly 24 hours. On September 14 the user confirmed receipt at the alias; migration 00019 was applied and the production activation flag was set. PR #27 and issue #18 record subsequent deployment and live verification evidence.

### Planned, not current guarantees

- Per-session context tags and notes: field-level encryption for **both** per requirements §4.3, optional collection, strict read/decrypt permissions, explicit retention/deletion rules, and exclusion from analytics/unauthorized prompts.
- AI descriptions: score-only inputs are intended, but no new pipeline or cache is live. Verify data flows, provider use, logging, safety-rule versions, and whether cache entries can be linked back to people before calling them anonymous or exempting them from deletion.
- Dedicated two-person comparisons: both participants consent before computation; either can revoke; both approve further sharing. Clarify the conflict between participant-only access and counselor sharing before making policy promises. Define whether consent covers one snapshot or future data.

## Proposed replacement language for review

### Information used to provide the service

Continua uses account and contact information to provide sign-in, respond to requests, and deliver requested materials. Depending on which features you use, this can include your name, email address, optional phone number, and selected interests.

When you complete an assessment, the service processes your answers to calculate scores. The current assessment storage records the scores, questionnaire reference, time, and associated account or browser identifier. If you maintain people or groups in your account, the service also stores the names and relationships you enter. These records may reveal personal tendencies or information about other people and should not be described as merely contact information.

**Release-dependent inquiry paragraph:** When you send a general inquiry, your name, email address, and message are delivered through our email provider to Albhy's mailbox. We use that information to respond. Please avoid including private assessment details or other sensitive information that is unnecessary for your question.

### Sharing you initiate

The existing individual-result link contains encoded score information. Anyone you give that link to may be able to view and copy that information. Removing an assessment from your account does not retrieve copies already shared through that link, downloaded, or captured by another person. This is distinct from the dedicated mutual-consent comparison feature currently being planned.

### Providers and service operations

Continua relies on providers for hosting, account authentication, data storage, and requested email or text delivery. **Before publication: insert the verified current provider list, purposes, relevant locations, and applicable contractual disclosures.** Do not claim contracts, transfer safeguards, or provider retention practices have been verified when they have not.

### Retention, deletion, and requests

**Decision required before publication:** define retention by data category, including inactive accounts, anonymous results, contacts, inquiry mail, delivery records, PDF links, logs, and backups. Specify what users can delete themselves, how other requests are handled, what residual copies remain, and the legally reviewed response commitments. Test deletion end-to-end before promising all account-linked data disappears on account closure.

**Contact verification required:** the current policy lists `privacy@continua.info`. Adding the contact alias does not prove the privacy mailbox exists or is monitored. Confirm the privacy-request destination and responsible person before finalizing the policy.

## Decisions for Albhy / counsel / engineering

1. Approve a factual inventory and primary purposes; address information entered about other people.
2. Choose retention periods and verify the account/contact/assessment deletion workflow, including encoded shares, PDF links, provider/mailbox copies, and backups.
3. Confirm age eligibility, parental-consent requirements if relevant, jurisdictions, provider terms, and actual privacy-request operations. This draft does not determine legal applicability.
4. Separate acknowledgment of assessment limitations from consent to specific uses/sharing and from optional communications. Version the relevant records when implemented.
5. Review the planned field encryption, authorization, AI data flow, and comparison consent design before adding those features to an effective policy.
6. Record approval under issue #45. The new Methodology & Limitations page explicitly remains draft disclosure language; it is not evidence of legal sign-off.

## Source paths

`src/app/privacy/page.tsx`; `src/app/quiz/page.tsx`; `src/app/quiz/api/submit/route.ts`; `src/lib/quiz/db.ts`; `src/lib/quiz/share.ts`; `src/app/quiz/api/share-verify/route.ts`; `src/app/my-info/actions.ts`; `src/app/my-info/passkey-settings.tsx`; `src/app/actions/relationships.ts`; `src/app/actions/get-started.ts`; `supabase/migrations/00001*`, `00006*`, `00011*`, `00013*`, `00014*`, `00015*`, `00016*`, `00018*`; `docs/setup/contact-delivery-runbook.md`. Inquiry release sources are in the separate contact-form branch: `src/app/actions/contact-inquiry.ts`, `src/lib/email/contact-inquiry.ts`, and migration `00019_contact_inquiry_rate_limit.sql`.
