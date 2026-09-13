import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { randomUUID } from 'node:crypto'

// Explicit opt-in: creates and removes one isolated live test account. No emails sent.
test('live passkey lifecycle and email recovery on both production origins', async ({ page, context }) => {
  test.skip(process.env.RUN_LIVE_PASSKEY_TEST !== '1', 'Requires explicit live-test opt-in and Supabase credentials')
  test.setTimeout(120_000)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
  const email = `continua-passkey-test-${randomUUID()}@example.com`
  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { name: 'Passkey verification (temporary)' } })
  if (createError || !created.user) throw createError ?? new Error('Test account creation failed')
  const userId = created.user.id
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: {
    protocol: 'ctap2', transport: 'internal', hasResidentKey: true,
    hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true,
  } })

  async function emailSession(origin: string) {
    // Generate/verify an actual email recovery token without delivering test mail.
    const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    if (error) throw error
    const jar = new Map<string, { name: string; value: string }>()
    const client = createServerClient(url, anonKey, { cookies: {
      getAll: () => [...jar.values()],
      setAll: (cookies) => cookies.forEach((cookie) => jar.set(cookie.name, cookie)),
    } })
    const result = await client.auth.verifyOtp({ token_hash: data.properties.hashed_token, type: 'magiclink' })
    if (result.error) throw result.error
    await context.addCookies([...jar.values()].map(({ name, value }) => ({ name, value, url: origin, secure: true, sameSite: 'Lax' as const })))
  }

  try {
    await emailSession('https://continua.info')
    await page.goto('https://continua.info/my-info')
    await expect(page.getByRole('button', { name: 'Add a passkey', exact: true })).toBeEnabled()
    await page.getByRole('button', { name: 'Add a passkey', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Passkey added')
    await page.getByRole('button', { name: 'Rename', exact: true }).click()
    await page.getByLabel('Passkey name').fill('Automated verification key')
    await page.getByRole('button', { name: 'Save name' }).click()
    await expect(page.getByText('Automated verification key', { exact: true })).toBeVisible()

    // Already-enrolled authenticator must not create a duplicate credential.
    await page.getByRole('button', { name: 'Add a passkey', exact: true }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'already registered' })).toBeVisible()

    for (const origin of ['https://continua.info', 'https://www.continua.info']) {
      await context.clearCookies()
      await page.goto(`${origin}/login?next=%2Fmy-info`)
      await page.getByRole('button', { name: 'Sign in with a passkey', exact: true }).click()
      await expect(page).toHaveURL(`${origin}/my-info`)
      await expect(page.getByText('Automated verification key', { exact: true })).toBeVisible()
    }

    // Verify cancellation on the real challenge flow, then recover successfully.
    await context.clearCookies()
    await cdp.send('WebAuthn.setAutomaticPresenceSimulation', { authenticatorId, enabled: false })
    await page.goto('https://continua.info/login')
    await page.getByRole('button', { name: 'Sign in with a passkey', exact: true }).click()
    await page.getByRole('button', { name: 'Cancel passkey request' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'cancelled or timed out' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Email me a sign-in link' })).toBeEnabled()
    await cdp.send('WebAuthn.setAutomaticPresenceSimulation', { authenticatorId, enabled: true })

    await emailSession('https://continua.info')
    await page.goto('https://continua.info/my-info')
    await page.getByRole('button', { name: 'Remove', exact: true }).click()
    await expect(page.getByText(/This is your last passkey/)).toBeVisible()
    await page.getByRole('button', { name: 'Confirm removal' }).click()
    await expect(page.getByText('No passkeys added yet.')).toBeVisible()
    await context.clearCookies()
    await emailSession('https://continua.info')
    await page.goto('https://continua.info/my-info')
    await expect(page.getByRole('heading', { name: 'My Info', exact: true })).toBeVisible()

    const unsupported = await context.newPage()
    await unsupported.addInitScript(() => { Object.defineProperty(window, 'PublicKeyCredential', { value: undefined }) })
    await context.clearCookies()
    await unsupported.goto('https://continua.info/login')
    await expect(unsupported.getByRole('button', { name: 'Email me a sign-in link' })).toBeVisible()
    await expect(unsupported.getByRole('button', { name: 'Sign in with a passkey', exact: true })).toHaveCount(0)
    await unsupported.close()
  } finally {
    await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
    // CRM contacts deliberately survive normal user deletion; remove this test row explicitly.
    const { error: contactError } = await admin.from('contacts').delete().eq('user_id', userId)
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (contactError || deleteError) throw contactError ?? deleteError
  }
})
