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

New users sign in by email, then add a passkey in **My Info → Passkeys**. Returning users choose **Sign in with a passkey** without entering their email. The completion route initializes account records and claims anonymous assessments before redirecting to the requested page. Unsupported browsers retain email sign-in.

My Info lists, renames, and removes passkeys. Removing the final passkey leaves email recovery available and explains that the device's password-manager copy must be removed separately. Registration and sign-in have cancellation controls and prevent duplicate submissions.

## Verification

Verify registration, discoverable sign-in, shared RP behavior on both origins, cancellation, duplicate registration, rename, removal, and email recovery. A virtual authenticator verifies the cryptographic flow; biometric UI and password-manager synchronization still depend on the user's browser/device.

On September 13, 2026, `tests/passkeys.spec.ts` passed against the live site with a Chromium virtual authenticator and a temporary confirmed account: enrollment, rename, duplicate detection, sign-in on both origins, cancellation, removal of the last passkey, actual email-token recovery, and unsupported-browser fallback. Email recovery used a generated/verified token without sending test mail. The test removes its account and CRM row in cleanup.

To repeat, provide `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` securely in the process environment, install the matching Playwright Chromium (`npx playwright install chromium`), then run `RUN_LIVE_PASSKEY_TEST=1 npx playwright test tests/passkeys.spec.ts --workers=1`. The test skips by default because it creates temporary records in the real project. Do not enable tracing or print session/cookie values.

## Operations

Supabase **Authentication → Passkeys** controls the backend feature. If unavailable, email sign-in remains functional. To revoke a lost credential, the user can sign in by email and remove it in My Info. Never put the Supabase service-role key or Management API token in the browser.

Reference: https://supabase.com/docs/guides/auth/passkeys
