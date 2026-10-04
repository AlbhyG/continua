import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { routeLocalAuthBuild } from './auth-test-routing'

test('email token signs in a fresh device and preserves its return destination', async ({ page, context }) => {
  test.skip(process.env.RUN_LIVE_PASSKEY_TEST !== '1', 'Explicit live test opt-in required; no emails sent')
  test.setTimeout(60_000)
  await routeLocalAuthBuild(context)
  await context.addInitScript(() => { Object.defineProperty(window, 'PublicKeyCredential', { value: undefined }) })
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
  const email = `continua-email-test-${randomUUID()}@example.com`
  const { data: created, error } = await admin.auth.admin.createUser({ email, email_confirm: false })
  if (error || !created.user) throw error ?? new Error('Could not create fixture')
  try {
    for (const origin of ['https://continua.info', 'https://www.continua.info']) {
      const returnTo = new URL('/auth/callback', origin)
      returnTo.searchParams.set('next', '/methodology?source=email#limits')
      const { data: link, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo: returnTo.toString() } })
      if (error) throw error
      // A fresh device has neither a session nor a PKCE verifier from requesting
      // the link. This is the same URL assembled by the deployed email template.
      await context.clearCookies()
      const callback = new URL('/auth/callback', 'https://continua.info')
      callback.searchParams.set('token_hash', link.properties.hashed_token)
      callback.searchParams.set('type', 'email')
      callback.searchParams.set('return_to', returnTo.toString())
      await page.goto(callback.toString())
      await expect(page).toHaveURL('https://continua.info/methodology?source=email#limits')
      expect((await context.cookies()).some((cookie) => cookie.name.includes('auth-token'))).toBe(true)
      // The same bearer token must not be usable a second time.
      await context.clearCookies()
      await page.goto(callback.toString())
      await expect(page).toHaveURL(/login\?error=callback/)
    }
  } finally {
    await admin.from('contacts').delete().eq('user_id', created.user.id)
    const { error } = await admin.auth.admin.deleteUser(created.user.id)
    if (error) throw error
  }
})
