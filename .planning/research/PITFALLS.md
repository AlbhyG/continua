# Pitfalls Research

**Domain:** Adding Supabase Backend & Email Verification to Existing Static Next.js 15 Site
**Researched:** 2026-02-15
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Static-to-Dynamic Route Collision

**What goes wrong:**
When adding Supabase authentication and database access to existing static pages, Next.js attempts to switch routes from static (pre-rendered at build time) to dynamic (rendered on each request) during runtime. This causes the "app/ Static to Dynamic Error" which crashes the build. Existing pages that were working perfectly as static exports suddenly fail to build when you add `cookies()`, `headers()`, or Supabase client calls that require authentication.

**Why it happens:**
Next.js 15 does not support switching between static and dynamic rendering modes during runtime. Your existing static pages were built with `force-static` or default static behavior. When you add Supabase authentication that reads cookies (session tokens), those same routes try to become dynamic, creating an irreconcilable conflict. The build system throws an error because it cannot guarantee consistent behavior.

**How to avoid:**
- Audit all existing routes and explicitly declare their rendering strategy BEFORE adding Supabase
- For pages that will remain static (Home, Who, What, Services), add `export const dynamic = 'force-static'` at the top
- For new pages that need authentication (Book download flow), create them in a separate route segment with `export const dynamic = 'force-dynamic'`
- Create a dedicated `/download` or `/protected` route for authenticated features, separate from public static pages
- Use middleware to handle authentication redirects without affecting static generation of public pages
- Test the build after each route modification: `npm run build` to catch conflicts early

**Warning signs:**
- Build fails with "Static to Dynamic Error" message
- Pages that previously built statically now show dynamic rendering warnings
- `generateStaticParams` returns empty arrays when it shouldn't
- Different behavior between `npm run dev` and `npm run build`
- Routes conflict: "The provided export path doesn't match the page"

**Phase to address:**
Phase 1 (Supabase Setup & Database Schema) - Before writing any Supabase integration code, map all existing routes and declare their static/dynamic intent. Phase 2 (Email Collection Infrastructure) - Verify that adding form submissions doesn't break static routes.

---

### Pitfall 2: Supabase Client Initialization Chaos

**What goes wrong:**
Developers create Supabase clients incorrectly, mixing server and client instances, using the wrong keys in the wrong environments, or creating new instances on every render. Server Components can't write cookies, so session refresh fails silently. Client Components use `createClientComponentClient()` but forget that it doesn't work in Server Components. The service role key gets exposed in client code, bypassing all Row Level Security. Sessions expire unexpectedly because middleware isn't refreshing auth tokens.

**Why it happens:**
Next.js 15 has three distinct execution environments (Server Components, Client Components, Middleware) and each requires a different Supabase client factory function. The documentation shows examples for each but doesn't clearly emphasize that mixing them causes silent failures. Developers copy-paste from tutorials that assume Next.js 14 patterns. The error messages are cryptic: "supabaseUrl or supabaseKey required" even when both are set, because the wrong client function is being used in the wrong context.

**How to avoid:**
- Create THREE separate Supabase client utilities in `lib/supabase/`:
  - `client.ts`: `createBrowserClient()` for Client Components (uses `NEXT_PUBLIC_SUPABASE_*` env vars)
  - `server.ts`: `createServerClient()` for Server Components, Server Actions, Route Handlers (uses `cookies()` from `next/headers`)
  - `middleware.ts`: `createServerClient()` specifically for middleware with `updateSession()` to refresh auth tokens
- NEVER use `SUPABASE_SERVICE_ROLE_KEY` in client-side code or expose it in `NEXT_PUBLIC_*` variables
- In middleware, always call `supabase.auth.getUser()` and `updateSession()` to keep sessions alive
- Use `supabase.auth.getUser()` in Server Components, NEVER `supabase.auth.getSession()` (session can be stale)
- Document which client to import where: add comments at the top of each utility file
- Create a linting rule or code comment that flags mixing client types

**Warning signs:**
- "supabaseUrl or supabaseKey required" error despite env vars being set
- Sessions expire after 5 minutes even though user is active
- Authentication works in development but fails in production
- Cookies aren't being set or read correctly
- TypeScript errors about `cookies()` not being available
- Different auth behavior between server and client navigation

**Phase to address:**
Phase 1 (Supabase Setup & Database Schema) - Set up client utilities correctly from day one. This is foundational; getting it wrong compounds into every feature.

---

### Pitfall 3: Row Level Security (RLS) Disabled or Incomplete

**What goes wrong:**
You create the `emails` table in Supabase to store email addresses, run your app, successfully insert data via the Supabase client, and think everything is working. Then you deploy to production and discover that ANYONE can read, insert, update, or delete ALL email addresses through the public API because Row Level Security is disabled. Alternatively, you enable RLS but forget to create policies, and now your app shows no data because every query returns empty results. No errors, just silent failures and user reports that "nothing works."

**Why it happens:**
Every new table created in Supabase has RLS **disabled** by default. This is the most dangerous default in the platform. The Supabase Dashboard shows a warning banner for tables without RLS, but if you create tables via SQL Editor or migrations (which you should for version control), there's no warning at all. Enabling RLS without creating policies is equally common: you check the "Enable RLS" box, think you're secure, but policies are what actually enforce security. Without policies, enabling RLS just blocks everything, including legitimate queries.

**How to avoid:**
- ALWAYS enable RLS when creating a table: `ALTER TABLE emails ENABLE ROW LEVEL SECURITY;`
- IMMEDIATELY create policies after enabling RLS, even if it's just a basic one
- For the `emails` table with public email collection:
  - Allow INSERT for anyone (anon role): `CREATE POLICY "Allow public insert" ON emails FOR INSERT TO anon WITH CHECK (true);`
  - Restrict SELECT/UPDATE/DELETE to authenticated admins only
- For PDF download verification (if tracked in database):
  - Allow SELECT only for verified users: `CREATE POLICY "Allow verified user select" ON downloads FOR SELECT TO authenticated USING (auth.uid() = user_id AND verified = true);`
- Test policies from the client SDK, NOT the SQL Editor (SQL Editor bypasses RLS)
- Add RLS check to CI: query Supabase API to list tables without RLS and fail the build
- Document each policy's purpose in the migration file
- Create indexes on columns used in RLS policies (e.g., `CREATE INDEX idx_downloads_user_id ON downloads(user_id);`)

**Warning signs:**
- Supabase Dashboard shows red warning: "Warning: RLS is not enabled on this table"
- Queries return all data regardless of authentication state (security issue)
- Queries return empty arrays after enabling RLS (missing policies)
- No errors but data doesn't appear in the app
- API responses succeed but with empty results
- Different users can see each other's data

**Phase to address:**
Phase 1 (Supabase Setup & Database Schema) - Enable RLS and create policies in the same migration as table creation. Never defer security to "later."

---

### Pitfall 4: Email Verification Token Consumption by Link Prefetching

**What goes wrong:**
Users click the email verification link sent to their inbox, but instead of being verified, they see "Token has expired or is invalid." The verification fails even though they clicked within seconds of receiving the email. This happens because their email provider (Microsoft Outlook with Safe Links, Gmail with link scanning, corporate email security tools) automatically fetched the verification URL to scan for malware BEFORE the user clicked it. The one-time-use token gets consumed by the prefetch, leaving the real user with an expired token.

**Why it happens:**
Modern email providers use security features that automatically access links in emails to check for malicious content. Microsoft Defender for Office 365 Safe Links, Gmail's link protection, Barracuda, Proofpoint, and similar tools fetch URLs immediately when the email is delivered. Supabase's default email verification flow uses one-time tokens in the URL (`/verify?token=abc123`). When the security tool visits the URL, Supabase marks the token as used. When the actual user clicks the same link minutes later, the token is already expired.

**How to avoid:**
- DO NOT use direct verification links with tokens in the URL for the primary flow
- Instead, implement a two-step verification:
  1. Email link goes to `/verify?email=user@example.com` (no token in URL)
  2. Page shows: "Check your email and enter the 6-digit code we sent"
  3. User enters the code manually, submits it via form
  4. Form submission calls Server Action to verify the token
- Alternatively, use magic link pattern with user action required:
  1. Email link goes to `/verify/confirm?token=abc123`
  2. Page shows button: "Click here to verify your email"
  3. Button click (POST request via Server Action) actually consumes the token
  4. Email prefetching only does a GET to the page, not the POST action
- Configure longer token expiration if using direct links: increase from default 1 hour to 24 hours
- In Supabase Dashboard → Authentication → Email Templates, customize the verification email to explain the two-step process
- Monitor failed verification attempts and send a new code if the first expires
- Detect if a token was consumed by prefetching: if token is consumed within <1 second of creation, auto-generate a new one

**Warning signs:**
- Users report "token expired" immediately after receiving email
- High rate of verification failures with "token_hash_not_found" or "otp_expired" errors
- Verification works for some email providers (personal Gmail) but fails for others (corporate Outlook)
- Verification fails on desktop but works on mobile (corporate networks have more aggressive link scanning)
- Success rate for email verification is below 80%

**Phase to address:**
Phase 3 (Email Verification Link Flow) - Build the two-step verification flow from the start. Don't launch with direct token URLs.

---

### Pitfall 5: Missing SMTP Configuration in Production

**What goes wrong:**
Email verification works perfectly in development: you sign up, receive the verification email within seconds, click the link, and you're verified. You deploy to production, and users start reporting they're not receiving emails. Some receive them 30 minutes late. Some never receive them. You check the logs: no errors. Supabase is reporting "email sent" successfully, but emails aren't arriving. Users can't access the Book PDF because they can't verify their email.

**Why it happens:**
Supabase's default email service is a shared SMTP server intended for **demonstration purposes only**. It has a rate limit of **2 emails per hour per project** with best-effort delivery. There's no guaranteed delivery, no retry mechanism, no bounce handling. It's fine for testing with 1-2 developers but completely inadequate for production. The default SMTP is also more likely to land in spam folders because it doesn't send from your domain. You never configured a custom SMTP provider because it "worked" in development.

**How to avoid:**
- Configure a custom SMTP provider BEFORE launching any email-based feature
- Recommended providers: SendGrid, AWS SES, Postmark, Resend, Mailgun
- In Supabase Dashboard → Project Settings → Authentication → SMTP Settings:
  - Enable custom SMTP
  - Configure host, port, username/password from your email provider
  - Set "Sender email" to `noreply@continua.com` (your domain for trust)
  - Set "Sender name" to "Continua"
- Disable link tracking in your SMTP provider (SendGrid, Mailgun have this feature) because it can interfere with Supabase verification URLs
- Configure SPF, DKIM, and DMARC records for your domain to improve deliverability
- Set up a dedicated subdomain for transactional emails: `mail.continua.com`
- Test email delivery to multiple providers: Gmail, Outlook, Yahoo, corporate email
- Implement email bounce/complaint webhooks from your SMTP provider to track failures
- Monitor email delivery metrics: delivery rate, bounce rate, spam complaints
- Set rate limits in Supabase Dashboard → Authentication → Rate Limits (default 30/hour is low; adjust based on your SMTP provider's limits)

**Warning signs:**
- Users report not receiving verification emails
- Emails arrive 10-30 minutes after being triggered
- Emails land in spam folders
- Supabase logs show "email sent" but users don't receive them
- Production email volume exceeds 2 per hour and emails stop sending
- Different users have different experiences (some get emails, some don't)

**Phase to address:**
Phase 2 (Email Collection Infrastructure) - Configure custom SMTP immediately after setting up the database, before implementing any email-sending features.

---

### Pitfall 6: Middleware Authentication Redirect Loops

**What goes wrong:**
You add middleware to protect the `/download` route, redirecting unauthenticated users to `/login`. Everything works in development. You deploy to production and users report infinite redirect loops: `/download` → `/login` → `/download` → `/login`. The browser throws "Too many redirects" errors. Or worse: the middleware redirects authenticated users AWAY from protected pages, requiring them to log in repeatedly even though they're already logged in.

**Why it happens:**
Next.js middleware runs on EVERY request, including redirects. If your middleware logic isn't precise, it creates loops: unauthenticated user requests `/download` → middleware redirects to `/login` → but `/login` is also checked by middleware → middleware sees no session → redirects to `/login` again. Additionally, middleware in Next.js 15 can't access hash fragments (`#token=abc`), so OAuth and magic link flows that rely on hash-based tokens don't work in middleware. The session check happens before the client has a chance to exchange the token for a session, causing the middleware to think the user is unauthenticated when they're actually mid-authentication.

**How to avoid:**
- Define a clear list of routes that middleware should IGNORE:
  ```typescript
  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico|api/auth|login|signup|verify).*)',
    ],
  }
  ```
- EXCLUDE auth-related routes from middleware protection: `/login`, `/signup`, `/verify`, `/auth/callback`
- In middleware, check if the current path is the redirect target and skip processing:
  ```typescript
  if (request.nextUrl.pathname === '/login') {
    return response; // Don't redirect login page to login page
  }
  ```
- Use `updateSession()` from `@supabase/ssr` to refresh expired tokens before checking auth state
- For OAuth/magic link flows, create a dedicated `/auth/callback` route that handles token exchange
- Don't perform authentication checks in middleware for auth callback routes
- Add logging to middleware to debug redirect loops (but remove in production for performance)
- Test authentication flow end-to-end: logout → request protected page → redirected to login → login → redirected back to protected page
- Handle edge case: user lands on `/login` while already authenticated (redirect to home or dashboard)

**Warning signs:**
- Browser error: "This page isn't working. [domain] redirected you too many times."
- Infinite redirect loops in Network tab showing repeating requests
- Users report getting "stuck" between login and protected pages
- Authenticated users are forced to login again immediately after logging in
- OAuth flows fail with "Token expired" after redirect
- Different behavior in development vs production (middleware behaves differently on Vercel Edge vs local Node.js)

**Phase to address:**
Phase 3 (Email Verification Link Flow) - When implementing authentication middleware, build redirect logic carefully and test all edge cases. Phase 4 (Book PDF Download Flow) - Verify middleware doesn't interfere with PDF serving.

---

### Pitfall 7: Environment Variables Not Exposed to Client Components

**What goes wrong:**
You create `.env.local` with `SUPABASE_URL` and `SUPABASE_ANON_KEY`, reference them in your Client Component, and get the error "supabaseUrl or supabaseKey required" even though the variables are clearly defined. The app works in development but breaks in production after deployment. TypeScript shows `process.env.SUPABASE_URL` as `undefined`. The Supabase client can't initialize.

**Why it happens:**
Next.js 15 has strict rules about environment variable visibility. Variables WITHOUT the `NEXT_PUBLIC_` prefix are ONLY available in Server Components, Server Actions, Route Handlers, and middleware. They are NOT bundled into the client JavaScript. This is a security feature to prevent accidentally exposing secrets in the browser. If you define `SUPABASE_URL` (without the prefix) and try to use it in a Client Component, it will be `undefined` at runtime. Deployment platforms (Vercel, Netlify) have their own environment variable management, and if you don't configure them correctly, production builds fail.

**How to avoid:**
- For Supabase URL and anon key (safe to expose publicly), use `NEXT_PUBLIC_` prefix:
  - `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`
- For service role key (NEVER expose), use NO prefix (server-only):
  - `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`
- Use separate env files for different environments:
  - `.env.local` for local development (gitignored)
  - `.env.production` for production-specific overrides
- Add `.env.example` to version control with dummy values to document required variables
- In deployment platform (Vercel, Netlify), configure environment variables in the dashboard
- Never commit `.env.local` or any file containing real secrets
- Use `process.env.NEXT_PUBLIC_SUPABASE_URL!` (TypeScript non-null assertion) if you're sure it's defined
- Add startup validation in `lib/supabase/client.ts`:
  ```typescript
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  ```
- Document which variables are required and where they're used

**Warning signs:**
- "supabaseUrl or supabaseKey required" error in browser console
- Environment variables undefined in Client Components but work in Server Components
- TypeScript errors: `process.env.VARIABLE_NAME` has type `undefined`
- App works in development (`npm run dev`) but fails in production build
- Different behavior between local and deployed environments
- Secrets accidentally exposed in browser DevTools → Sources → webpack bundle

**Phase to address:**
Phase 1 (Supabase Setup & Database Schema) - Set up environment variables correctly from the start. Add validation to prevent runtime failures.

---

### Pitfall 8: PDF File Serving Without Proper Authorization

**What goes wrong:**
You implement the email verification flow, store the Book PDF in `/public/book.pdf`, and send users to `/book.pdf` after verification. You deploy and discover that anyone who guesses the URL can download the PDF without verifying their email. The entire authentication gate is bypassed. Alternatively, you try to serve the PDF through a Server Action or Route Handler, but large files (5+ MB PDFs) cause memory issues, timeouts, or exceed serverless function limits.

**Why it happens:**
Files in `/public/` are served directly by Next.js (or your CDN) as static assets. They are NOT protected by authentication middleware or Server Components. Any URL like `/book.pdf` is publicly accessible regardless of session state. Developers assume that because the link is only shown to authenticated users, the file is protected, but direct URL access bypasses the UI. Serving large files through serverless functions hits memory limits (Vercel functions have 1024 MB limit on Hobby plan) and timeout limits (10 seconds for Hobby, 60 seconds for Pro). Streaming files through Server Actions adds unnecessary latency.

**How to avoid:**
- DO NOT put protected PDFs in `/public/` folder
- Instead, use one of these approaches:

**Option 1: Supabase Storage (Recommended)**
  - Upload PDF to Supabase Storage bucket
  - Set bucket policy to require authentication: `CREATE POLICY "Require email verification" ON storage.objects FOR SELECT USING (bucket_id = 'protected-files' AND auth.jwt()->>'email_verified' = 'true');`
  - Generate signed URLs with expiration: `supabase.storage.from('protected-files').createSignedUrl('book.pdf', 3600)` (1 hour expiration)
  - Return the signed URL to verified users only
  - Signed URL expires automatically, preventing long-term sharing

**Option 2: Route Handler with Authentication**
  - Move PDF outside `/public/`, e.g., to `storage/` (not served by Next.js)
  - Create Route Handler `/api/download/book` that:
    1. Checks authentication: `supabase.auth.getUser()`
    2. Verifies email is verified: `user.email_verified === true`
    3. Streams file as response: `fs.createReadStream()` → `Response` with `ReadableStream`
  - Use `X-Accel-Redirect` (Nginx) or equivalent for efficient file serving (offload to reverse proxy)

**Option 3: Vercel Blob Storage (if using Vercel)**
  - Upload PDF to Vercel Blob
  - Generate downloadable URLs in API route after auth check
  - Vercel handles large file serving efficiently

- For any approach, set proper `Content-Disposition` header: `Content-Disposition: attachment; filename="continua-book.pdf"`
- Add rate limiting to prevent abuse: max 5 downloads per user per day
- Log download events for analytics: track who downloaded, when, from where
- Consider adding watermarking or user-specific metadata to PDFs (advanced)

**Warning signs:**
- Users report sharing direct PDF URLs that work for anyone
- PDF URLs don't require authentication to access
- Large PDF downloads fail with timeout errors
- Serverless function memory exceeded errors
- PDF downloads are slow (>10 seconds for a 5 MB file)
- Users can download PDFs by guessing the filename

**Phase to address:**
Phase 4 (Book PDF Download Flow) - Implement secure file serving from the start. Test with unauthenticated requests to verify protection.

---

### Pitfall 9: Navigation Restructure Breaks Existing Links and SEO

**What goes wrong:**
You restructure the navigation dropdowns (merge What and Services into "Our Work", rename "Who" to "For Who"), update the internal links, and deploy. Google Search Console shows a spike in 404 errors. External sites and bookmarks pointing to `/what` now break. Users land on error pages. Social media shares with old URLs show broken links. SEO rankings drop for pages that were previously indexed.

**Why it happens:**
Your v1.0 site has been live and indexed by search engines. External sites may have linked to your pages. Users may have bookmarked specific pages. When you rename or move pages without setting up redirects, all those links break. Next.js doesn't automatically create redirects when you change route structure. The old URLs return 404 errors, creating a poor user experience and SEO penalties.

**How to avoid:**
- Before restructuring, audit all existing URLs that need to be preserved
- Create redirects in `next.config.ts` for any changed URLs:
  ```typescript
  async redirects() {
    return [
      {
        source: '/what',
        destination: '/our-work',
        permanent: true, // 301 redirect for SEO
      },
      {
        source: '/who/:slug',
        destination: '/for-who/:slug',
        permanent: true,
      },
    ];
  }
  ```
- Use 301 (permanent) redirects for renamed/moved pages to transfer SEO value
- Use 302 (temporary) redirects for temporary changes
- Update internal links throughout the site to use new URLs (don't rely on redirects for internal navigation)
- Update sitemap.xml with new URLs and submit to Google Search Console
- Check for broken links in Google Search Console → Coverage → Not Found errors
- Test all old URLs manually to verify redirects work
- Update any external links you control (social media bios, email signatures, documentation)
- Add redirect tests to CI: automated checks that old URLs return 301/302 to new URLs
- Consider keeping redirects indefinitely (they're cheap and prevent broken links)

**Warning signs:**
- Google Search Console shows spike in 404 errors
- Users report "page not found" when clicking old bookmarks
- SEO traffic drops for specific pages
- External backlinks show broken link warnings
- Social media shares of old URLs don't work
- Analytics show increased bounce rate from search engine traffic

**Phase to address:**
Phase 5 (Navigation Restructure) - Set up all redirects in the same deployment that changes URLs. Test before deploying.

---

## Moderate Pitfalls

### Pitfall 10: Forgetting to Handle Email Already Verified State

**What goes wrong:**
A user signs up, verifies their email, and successfully downloads the Book PDF. They close the browser. Later, they return to the site and click "Get the Book" again, enter their email again, and get a confusing error or duplicate entry. Or worse: they receive a new verification email even though they're already verified, and clicking it breaks their account state.

**Prevention:**
- Check if email is already verified BEFORE sending verification email:
  ```typescript
  const existingUser = await supabase
    .from('emails')
    .select('verified')
    .eq('email', email)
    .single();

  if (existingUser?.verified) {
    // Send them directly to download page or magic link to login
    return { message: 'Email already verified. Check your email for download link.' };
  }
  ```
- If user is already in the database but not verified, resend verification (invalidate old token)
- If user is verified, send them a magic link to login and download
- Show clear messaging: "We've sent you a login link to access your download"
- Handle duplicate email entries gracefully (unique constraint on email column in database)
- Add "Already verified? Click here to login" link on verification page

**Phase to address:**
Phase 3 (Email Verification Link Flow) - Build this logic when implementing verification flow.

---

### Pitfall 11: Missing Loading States During Email Submission

**What goes wrong:**
User fills out the email form, clicks "Get the Book," and nothing happens. No feedback. They click again. Still nothing visible. They click 5 more times. Behind the scenes, 7 email verification requests are queued, sending 7 verification emails to their inbox. User is confused and frustrated.

**Prevention:**
- Add immediate loading state when form is submitted:
  ```typescript
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    setIsSubmitting(true);
    try {
      await submitEmail(email);
    } finally {
      setIsSubmitting(false);
    }
  }
  ```
- Disable submit button during submission: `disabled={isSubmitting}`
- Show loading spinner or skeleton in button: "Submitting..." or spinner icon
- Show success message immediately after successful submission: "Check your email for verification link"
- Handle errors gracefully with user-friendly messages: "Something went wrong. Please try again."
- Use optimistic UI: immediately show success state, revert if request fails
- Implement debouncing or rate limiting on client side to prevent duplicate submissions
- Add toast notifications for success/error states

**Phase to address:**
Phase 2 (Email Collection Infrastructure) - Add to the email submission form component.

---

### Pitfall 12: Not Handling Email Verification Errors Gracefully

**What goes wrong:**
User's verification link expires (after 24 hours). They click it and see a cryptic error page: "Token has expired." No guidance on what to do next. They're stuck. They can't access the PDF. They contact support. Or worse: the error is shown as a default Next.js error page with stack traces in development mode.

**Prevention:**
- Create custom error pages for common verification failures:
  - `/verify/expired` - Token expired, offer to resend
  - `/verify/invalid` - Token invalid, offer to try again
  - `/verify/success` - Verification successful, redirect to download
- In verification route handler, catch specific error types:
  ```typescript
  try {
    await supabase.auth.verifyOtp({ token_hash, type: 'email' });
    redirect('/download');
  } catch (error) {
    if (error.message.includes('expired')) {
      redirect('/verify/expired?email=' + email);
    }
    redirect('/verify/invalid');
  }
  ```
- On error pages, provide clear next steps:
  - "Your verification link has expired. Enter your email to receive a new one."
  - Include a form to resend verification email
- Log verification errors for debugging and monitoring
- Set up alerts for high verification failure rates (>20%)
- Test error scenarios: expired token, invalid token, already used token, missing token

**Phase to address:**
Phase 3 (Email Verification Link Flow) - Create error pages when building verification flow.

---

### Pitfall 13: Cookie SameSite Attribute Issues in Production

**What goes wrong:**
Authentication works perfectly in local development (localhost). You deploy to production and users report they can't stay logged in. Sessions expire immediately. Login succeeds but subsequent requests show as unauthenticated. Cookies aren't being sent with requests.

**Prevention:**
- Supabase sets cookies with `SameSite=Lax` by default
- If your app is on a different domain than Supabase (`continua.com` vs `your-project.supabase.co`), cookies may be blocked
- Use custom domain for Supabase if possible (Enterprise plan) or ensure same-origin
- Check that your site is served over HTTPS in production (cookies with `Secure` flag require HTTPS)
- In Supabase Dashboard → Authentication → URL Configuration, set:
  - Site URL: `https://continua.com`
  - Redirect URLs: `https://continua.com/auth/callback`
- Test authentication on production domain, not localhost
- Check browser DevTools → Application → Cookies to verify cookies are being set
- Modern browsers block third-party cookies; verify your setup doesn't rely on them

**Phase to address:**
Phase 3 (Email Verification Link Flow) - Test on production domain before launch.

---

### Pitfall 14: Database Migration Drift Between Environments

**What goes wrong:**
You create the `emails` table in Supabase Dashboard manually in development. Everything works. You deploy to production and create the table manually again, but with slightly different column types or constraints. Queries that work in development fail in production. Or worse: you forget to create the table in production entirely and get "relation does not exist" errors.

**Prevention:**
- NEVER create tables manually in Supabase Dashboard for production use
- Use Supabase CLI to manage migrations:
  ```bash
  supabase init
  supabase migration new create_emails_table
  # Edit migration file with CREATE TABLE
  supabase db push
  ```
- Store migrations in version control (`supabase/migrations/`)
- Apply migrations to production via CLI: `supabase db push --project-ref your-prod-ref`
- Generate TypeScript types from database schema: `supabase gen types typescript`
- Keep development and production schemas in sync
- Test migrations on staging environment before production
- Use migration rollback capability for failed migrations

**Phase to address:**
Phase 1 (Supabase Setup & Database Schema) - Set up migration workflow from the start.

---

### Pitfall 15: Hardcoded URLs and Environment-Specific Logic

**What goes wrong:**
You hardcode `https://continua.com/verify` in the email template. Local development verification emails link to production instead of `http://localhost:3000/verify`. Or production links point to localhost because you forgot to update them. OAuth redirects go to the wrong domain.

**Prevention:**
- Use environment variables for all URLs:
  ```typescript
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const verifyUrl = `${siteUrl}/verify?token=${token}`;
  ```
- Configure `NEXT_PUBLIC_SITE_URL` in:
  - `.env.local`: `http://localhost:3000`
  - Vercel/Netlify environment variables: `https://continua.com`
- In Supabase email templates, use `{{ .SiteURL }}/verify` (Supabase template variable)
- Supabase Site URL is set in Dashboard → Authentication → URL Configuration
- Set different Site URLs for different Supabase projects (dev vs prod)
- Test email links in all environments to verify they point to correct domain

**Phase to address:**
Phase 2 (Email Collection Infrastructure) - Set up environment-aware URLs before implementing email flows.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing PDF in `/public/` instead of protected storage | Quick to implement, no backend needed | PDF is publicly accessible by direct URL, security bypass | Never for gated content |
| Using default Supabase SMTP instead of custom provider | Zero configuration, works immediately | 2 emails/hour limit, poor deliverability, unprofessional | Only for early development/testing |
| Skipping RLS policies during development | Faster iteration, no policy debugging | Catastrophic security hole if forgotten before launch | Acceptable for local dev ONLY if migrations enable RLS before production |
| Hardcoding site URLs instead of using env vars | Works quickly for single environment | Breaks when switching environments, forces manual updates | Never - env vars are trivial to set up |
| Using direct token URLs instead of two-step verification | Simpler email template, one less page | Link prefetching breaks verification for many users | Never in production - prefetching is too common |
| Mixing Supabase client types (server/client) | Fixes immediate errors, compiles | Silent failures, session bugs, auth doesn't work reliably | Never - proper clients are well-documented |
| Not setting up database migrations | Tables created faster in Dashboard | Schema drift, production incidents, no rollback | Never - migrations are essential |
| Skipping redirect setup when restructuring navigation | Faster deployment, fewer files to change | SEO damage, broken external links, poor UX | Never - redirects are critical for URL changes |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase + Server Components | Using `createClientComponentClient()` in Server Components | Use `createServerClient()` with `cookies()` from `next/headers` |
| Supabase + Middleware | Not calling `updateSession()` to refresh tokens | Always call `updateSession()` in middleware before checking auth |
| SMTP + Supabase | Enabling link tracking in SendGrid/Mailgun | Disable link tracking - it breaks verification URLs |
| Environment Variables | Using non-prefixed vars in Client Components | Use `NEXT_PUBLIC_` prefix for client-accessible variables |
| Next.js Static + Supabase | Adding dynamic features to static routes without declaring `dynamic` | Explicitly set `export const dynamic = 'force-static'` or `'force-dynamic'` |
| PDF Serving | Serving large files through serverless functions | Use Supabase Storage with signed URLs or external blob storage |
| Email Verification | Using one-time tokens directly in email links | Implement two-step verification or user action required to avoid prefetching issues |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading PDF files into serverless function memory | Timeout errors, memory exceeded, failed downloads | Use Supabase Storage signed URLs or streaming via Route Handlers | PDFs larger than 5 MB on Vercel Hobby plan (1024 MB function memory limit) |
| Creating new Supabase client on every render | Slow performance, connection pool exhaustion | Create client once per request, use React Context or singleton | High traffic (100+ concurrent users) |
| Missing indexes on RLS policy columns | Slow queries (>1s for simple selects), database timeouts | Always index columns used in RLS policies: `CREATE INDEX idx_emails_user_id ON emails(user_id);` | Tables with >10k rows |
| Sending verification emails synchronously in form submission | Form submission hangs for 2-5 seconds while email sends | Queue email sending (use Server Action that returns immediately, email sends async) | Any production use - users expect instant feedback |
| Not caching email verification status | Database query on every page load to check if verified | Cache verification status in session or JWT claims | Pages with >1000 daily visitors |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing `SUPABASE_SERVICE_ROLE_KEY` in client code | Complete bypass of Row Level Security, full database access to attackers | Never use `NEXT_PUBLIC_` prefix for service role key, only use in Server Actions/Route Handlers |
| Not enabling RLS on `emails` table | Anyone can read, modify, delete all email addresses via Supabase API | Enable RLS immediately: `ALTER TABLE emails ENABLE ROW LEVEL SECURITY;` |
| Using `supabase.auth.getSession()` instead of `getUser()` in Server Components | Stale sessions, security bypass (session not revalidated) | Always use `supabase.auth.getUser()` in Server Components for auth checks |
| Serving PDFs from `/public/` folder | Anyone can download by guessing URL, authentication gate bypassed | Store PDFs in Supabase Storage with RLS or outside `/public/` with Route Handler auth |
| No rate limiting on email submission | Spam, abuse, email provider rate limit violations | Add rate limiting: max 5 verification emails per email address per hour |
| Accepting unvalidated email addresses | Database pollution, spam traps, security issues | Validate email format on client and server, consider using email verification service |
| Not logging download events | No audit trail, can't detect abuse, no analytics | Log all download events with user ID, timestamp, IP address |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No feedback after email submission | User unsure if it worked, clicks multiple times, receives duplicate emails | Show immediate success message: "Check your email for verification link" |
| Cryptic error messages for verification failures | User stuck, doesn't know what to do, abandons flow | Clear messaging with next steps: "Link expired. Enter your email to receive a new one." |
| Verification link expires too quickly (1 hour default) | User checks email later, link expired, frustrating experience | Extend to 24 hours for better UX, balance with security |
| No "already verified" handling | User confused why they're getting verification email again, duplicate entries | Detect verified users, send download link directly instead of verification |
| Email lands in spam folder | User never receives verification, thinks site is broken | Configure SPF/DKIM/DMARC, use custom SMTP from your domain, avoid spam trigger words |
| No way to resend verification email if lost | User stuck, can't proceed, contacts support | Add "Resend verification email" button on verification pending page |

---

## "Looks Done But Isn't" Checklist

- [ ] **Email submission form:** Often missing loading states and error handling - test with network throttling and invalid inputs
- [ ] **RLS policies:** Often enabled but with no policies created - test queries from client SDK, verify they respect policies
- [ ] **SMTP configuration:** Often using default Supabase SMTP - verify custom SMTP is configured in production
- [ ] **Email verification:** Often using direct token URLs - verify two-step flow or user action required to avoid prefetching
- [ ] **PDF access control:** Often files in `/public/` - verify PDFs are in protected storage with auth checks
- [ ] **Environment variables:** Often missing `NEXT_PUBLIC_` prefix - verify client components can access needed variables
- [ ] **Middleware redirect logic:** Often creates redirect loops - test all edge cases (authenticated on login page, unauthenticated on protected page, mid-auth callback)
- [ ] **Navigation redirects:** Often missing when restructuring URLs - test all old URLs return proper 301/302 redirects
- [ ] **Database migrations:** Often tables created manually - verify migrations exist in `supabase/migrations/` and are in version control
- [ ] **Static/dynamic route declarations:** Often missing explicit `export const dynamic` - verify build succeeds and static pages are actually static
- [ ] **Error handling:** Often showing generic error pages - verify custom error pages for verification failures, expired tokens, etc.
- [ ] **Email already verified state:** Often not checked - verify resubmission is handled gracefully

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Static-to-dynamic route collision | MEDIUM | Add explicit `export const dynamic = 'force-static'` or `'force-dynamic'` to all routes, separate protected routes into dedicated path, rebuild |
| Supabase client initialization chaos | LOW-MEDIUM | Create proper client utilities for server/client/middleware, update all imports, test auth flow end-to-end |
| RLS disabled or incomplete | HIGH | Immediately enable RLS on all tables, create policies, test from client SDK, audit for data exposure, rotate anon key if needed |
| Email verification token prefetching | MEDIUM | Implement two-step verification flow, update email templates, test with corporate email providers |
| Missing SMTP configuration | LOW | Configure custom SMTP provider, update Supabase settings, test email delivery to multiple providers |
| Middleware redirect loops | MEDIUM | Fix matcher config to exclude auth routes, add path checks, test all redirect scenarios, add logging |
| Environment variables not exposed | LOW | Rename variables with `NEXT_PUBLIC_` prefix, update code references, configure in deployment platform |
| PDF serving without authorization | HIGH | Move PDFs to Supabase Storage or protected directory, implement auth checks, test with unauthenticated requests, audit access logs |
| Navigation restructure breaks links | MEDIUM | Add redirects in `next.config.ts`, update sitemap, submit to search engines, monitor 404 errors |
| Email already verified state | LOW | Add database check before sending email, implement smart routing, update flow logic |
| Missing loading states | LOW | Add `isSubmitting` state, disable button during submission, show spinner/loading text |
| Email verification errors | LOW-MEDIUM | Create custom error pages, add resend functionality, implement error handling in verification route |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Static-to-dynamic collision | Phase 1 (Supabase Setup) | Build succeeds, static routes remain static, new dynamic routes work correctly |
| Supabase client initialization | Phase 1 (Supabase Setup) | No "missing key" errors, sessions persist correctly, auth works in all component types |
| RLS disabled/incomplete | Phase 1 (Supabase Setup) | Dashboard shows no RLS warnings, queries from client SDK respect policies |
| Email verification token prefetching | Phase 3 (Email Verification Flow) | Verification success rate >90%, works with Outlook/corporate email |
| Missing SMTP configuration | Phase 2 (Email Collection) | Emails deliver within 30 seconds, no rate limit errors, emails don't land in spam |
| Middleware redirect loops | Phase 3 (Email Verification Flow) | No redirect loops, auth flow works end-to-end, protected routes stay protected |
| Environment variables not exposed | Phase 1 (Supabase Setup) | Client components can access public vars, secrets stay server-only |
| PDF serving without auth | Phase 4 (Book PDF Download) | Unauthenticated requests return 401/403, authenticated verified users can download |
| Navigation restructure breaks links | Phase 5 (Navigation Restructure) | Old URLs redirect to new ones, Google Search Console shows no new 404s |
| Email already verified state | Phase 3 (Email Verification Flow) | Resubmissions handled gracefully, no duplicate entries, clear messaging |
| Missing loading states | Phase 2 (Email Collection) | Form shows immediate feedback, button disabled during submission |
| Email verification errors | Phase 3 (Email Verification Flow) | Custom error pages shown, users can resend verification, clear next steps |
| Cookie SameSite issues | Phase 3 (Email Verification Flow) | Sessions persist on production domain, cookies set correctly |
| Database migration drift | Phase 1 (Supabase Setup) | Migrations in version control, dev and prod schemas match |
| Hardcoded URLs | Phase 2 (Email Collection) | All URLs use env vars, work correctly in all environments |

---

## Sources

### Next.js 15 App Router and Supabase Integration
- [Build a User Management App with Next.js | Supabase Docs](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Use Supabase with Next.js | Supabase Docs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth with the Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router: common mistakes and how to fix them - Upsun](https://upsun.com/blog/avoid-common-mistakes-with-next-js-app-router/)
- [App Router pitfalls: common Next.js mistakes and practical ways to avoid them](https://imidef.com/en/2026-02-11-app-router-pitfalls)

### Static to Database Migration
- [Why a Database Migration Forced an API Redesign | Medium](https://medium.com/data-science-collective/why-a-database-migration-forced-an-api-redesign-ac82f7256142)
- [Database Migration Horror Stories: Lessons from 10 Companies | Medium](https://medium.com/the-tech-draft/database-migration-horror-stories-lessons-from-10-companies-that-got-it-wrong-and-right-71857e3319da)
- [Supabase Pitfalls: Avoid These Common Mistakes for a Robust Backend](https://hrekov.com/blog/supabase-common-mistakes)

### Row Level Security
- [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Row Level Security (RLS): Complete Guide (2026)](https://designrevision.com/blog/supabase-row-level-security)
- [Supabase Row Level Security Explained With Real Examples | Medium](https://medium.com/@jigsz6391/supabase-row-level-security-explained-with-real-examples-6d06ce8d221c)

### Email Verification Security
- [Supabase Docs | Troubleshooting | OTP Verification Failures](https://supabase.com/docs/guides/troubleshooting/otp-verification-failures-token-has-expired-or-otp_expired-errors-5ee4d0)
- [Email Templates | Supabase Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Password-based Auth | Supabase Docs](https://supabase.com/docs/guides/auth/passwords)
- [Managing Two Email Notifications Using Supabase and Next.js | Medium](https://medium.com/@python-javascript-php-html-css/handling-dual-email-notifications-with-next-js-and-supabase-02f729d5892b)

### SMTP Configuration
- [Production Checklist | Supabase Docs](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Send emails with custom SMTP | Supabase Docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [Notice: Change to the email rate limits | Supabase Discussion](https://github.com/orgs/supabase/discussions/15896)
- [Supabase Custom SMTP and Email Configuration Guide](https://sendlayer.com/blog/supabase-custom-smtp-and-email-configuration-guide/)

### Authentication and Middleware
- [Next.js App with @supabase/auth-helpers-nextjs middleware | Discussion](https://github.com/orgs/supabase/discussions/13879)
- [OAuth and magic links with Supabase and NextJS middleware - Basejump](https://usebasejump.com/blog/supabase-oauth-with-nextjs-middleware)
- [Next.js doesn't support auth redirects in middleware for server actions | Issue](https://github.com/supabase/ssr/issues/50)

### Environment Variables and Security
- [Creating a Supabase client for SSR | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js Security Best Practices](https://makerkit.dev/docs/next-supabase-turbo/security/nextjs-best-practices)
- [Complete Next.js security guide 2025](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices)
- [Secure configuration of Supabase products | Supabase Docs](https://supabase.com/docs/guides/security/product-security)

### Static to Dynamic Migration
- [Resolving "app/ Static to Dynamic Error" in Next.js](https://nextjs.org/docs/messages/app-static-to-dynamic-error)
- [How to Fix Next.js searchParams Killing Static Generation](https://www.buildwithmatija.com/blog/nextjs-searchparams-static-generation-fix)
- [Migrating: App Router | Next.js](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

### PDF Serving and File Security
- [Top 5 authentication solutions for secure Next.js apps in 2026 — WorkOS](https://workos.com/blog/top-authentication-solutions-nextjs-2026)
- [Next.js Security Hardening: Five Steps to Bulletproof Your App in 2026 | Medium](https://medium.com/@widyanandaadi22/next-js-security-hardening-five-steps-to-bulletproof-your-app-in-2026-61e00d4c006e)
- [Guides: Data Security | Next.js](https://nextjs.org/docs/app/guides/data-security)
- [Storage Access Control | Supabase Docs](https://supabase.com/docs/guides/storage/security/access-control)

### Email Security and Authentication Standards 2026
- [Microsoft's Modern Authentication Enforcement in 2026](https://www.getmailbird.com/microsoft-modern-authentication-enforcement-email-guide/)
- [Essential Email Authentication Guide 2026](https://cmercury.com/blog/email-authentication-2026/)
- [2026 Guide: Best Practices for User Verification](https://www.fastpasscorp.com/best-practices-for-user-verification/)

---

*Pitfalls research for: Adding Supabase Backend, Email Verification, and PDF Download Flows to Existing Static Next.js 15 Site (Continua v2.0)*
*Researched: 2026-02-15*
*Confidence: HIGH (verified through official Supabase and Next.js documentation, 2026 security standards, real-world issue reports, and community best practices)*
