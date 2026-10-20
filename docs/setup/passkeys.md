# Passkey sign-in

Supabase's experimental first-factor passkey API is approved in issue #20. The SDK is pinned to 2.116.0; review its passkey API when upgrading.

Production Supabase project: `tiyyznmbumlwrugspslc` (Continua).

- Enable passkey authentication.
- RP display name: `Continua`.
- Stable RP ID: `continua.info`.
- Allowed origins: `https://continua.info,https://www.continua.info`.
- Email callback allowlist includes `/auth/callback` on both origins.

These settings were applied through the Supabase Management API on September 13, 2026. Do not change the RP ID after enrollment: existing credentials would stop working. Do not add preview URLs to this production RP. Local testing needs a separate Supabase project with a localhost RP, or a virtual authenticator test against the production origins using an isolated test account.

## User flow

Issue #47 replaces the passkey-first screen with one email field. On browsers supporting conditional WebAuthn mediation, saved passkeys are offered through email-field autofill without automatically launching a modal or phone prompt. Otherwise, users request the existing email link. **Use a saved passkey** remains a secondary, explicitly explained option for returning users and cross-device credentials. Cancelling or failing that ceremony shows an in-app email fallback. The site does not query whether an entered email has an account or a passkey.

Successful email sign-in passes through `/auth/passkey-setup` before returning to the requested page. On supported production browsers, accounts with no registered passkeys receive a one-time, skippable setup offer. Migration 00020 stores `contacts.passkey_setup_offered_at`; its authenticated, account-scoped RPC atomically consumes the offer. Unsupported browsers and backend errors proceed without blocking sign-in. Skipping does not disable manual setup in **My Info → Passkeys**. Existing accounts without passkeys get the offer on their next email sign-in; this is not limited to newly created accounts.

Both paths use Supabase's existing verified-email user and the same `user_id`; enrollment attaches a credential to the signed-in account. No anonymous/device identity or password is created. If a passkey selection belongs to a different entered email, the local session is signed out and the user is directed back to email. Account initialization and anonymous-assessment claiming remain in the authenticated completion flow. Existing admin-only operational access gates and PDF encryption passwords are unchanged; neither is an end-user account password.

Browsers cannot expose a list of available passkeys to application code before user selection. Conditional autofill is therefore the supported immediate offer, not a promise that every browser/password manager will show identical UI or literally require one tap. Supabase's pinned SDK currently requires its two-step API for conditional mediation; `src/lib/auth/passkey-autofill.ts` converts the challenge and signed assertion, while Supabase performs all verification.

My Info lists, renames, and removes passkeys. Removing the final passkey leaves email recovery available and explains that the device's password-manager copy must be removed separately. Registration and sign-in have cancellation controls and prevent duplicate submissions.

## Verification

Verify registration, discoverable sign-in, shared RP behavior on both origins, cancellation, duplicate registration, rename, removal, and email recovery. A virtual authenticator verifies the cryptographic flow; biometric UI and password-manager synchronization still depend on the user's browser/device.

On September 13, 2026, `tests/passkeys.spec.ts` passed against the live site with a Chromium virtual authenticator and a temporary confirmed account: enrollment, rename, duplicate detection, sign-in on both origins, cancellation, removal of the last passkey, actual email-token recovery, and unsupported-browser fallback. Email recovery used a generated/verified token without sending test mail. The test removes its account and CRM row in cleanup.

To repeat, provide `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` securely in the process environment, install the matching Playwright Chromium (`npx playwright install chromium`), then run `RUN_LIVE_PASSKEY_TEST=1 npx playwright test tests/passkeys.spec.ts --workers=1`. The test skips by default because it creates temporary records in the real project. Do not enable tracing or print session/cookie values.

## Operations

### Issue #47 release checks (September 14, 2026)

Migration 00020 is installed in production; anonymous execution is denied and authenticated execution is allowed. The production build and all five targeted authentication tests passed against the local production build using an isolated account in the real Supabase project. This includes real conditional and explicit WebAuthn sign-in with a Chromium virtual authenticator, identical returned `user_id` and the same saved assessment on both origins, wrong-email rejection, cancellation, registration/duplicate handling/rename/removal, email-token recovery, and one-time skip persistence across origins. Four mocked-request UI tests cover no modal on first load, missing credentials, unsupported browsers, failed email delivery, and stalled autofill not blocking email. No test email is sent by this suite; generated tokens verify the email authentication path without inbox delivery. Synthetic accounts and result/contact/browser-token records are removed afterward.

Local UI testing can set `CONTINUA_LOCAL_AUTH_SERVER=http://localhost:3111` while running a production build on that port. The test-only routing helper keeps Continua page requests on that build at the configured RP origins, while Supabase verifies real credentials. Omit the variable to repeat against the actual deployed site. Release/deployment and post-deployment test outcomes are recorded in issue #47 and its PR. Biometric dialogs and password-manager sync remain device-dependent; the test does not claim to emulate every device.

Supabase **Authentication → Passkeys** controls the backend feature. If unavailable, email sign-in remains functional. To revoke a lost credential, the user can sign in by email and remove it in My Info. Never put the Supabase service-role key or Management API token in the browser.

Reference: https://supabase.com/docs/guides/auth/passkeys
