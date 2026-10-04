import { test, expect } from '@playwright/test'
import { routeLocalAuthBuild } from './auth-test-routing'

test.beforeEach(async ({ context }) => { await routeLocalAuthBuild(context) })

test('a stalled autofill challenge cannot block email sign-in', async ({ page }) => {
  let release: () => void = () => {}
  const barrier = new Promise<void>((resolve) => { release = resolve })
  let requested: () => void = () => {}
  const challengeRequested = new Promise<void>((resolve) => { requested = resolve })
  await page.addInitScript(() => { PublicKeyCredential.isConditionalMediationAvailable = async () => true })
  await page.route('**/auth/v1/passkeys/authentication/options', async (route) => {
    requested()
    await barrier
    await route.fulfill({ json: { challenge_id: 'test', options: { challenge: 'AQID', rpId: 'continua.info' } } })
  })
  await page.route('**/auth/v1/otp**', (route) => route.fulfill({ json: {} }))
  try {
    await page.goto('https://continua.info/login')
    await challengeRequested
    await page.getByLabel('Email', { exact: true }).fill('test@example.com')
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
    await expect(page.getByRole('status')).toContainText('Check your email')
  } finally { release() }
})

test('email-first UI never opens a modal passkey prompt automatically and email remains usable', async ({ page }) => {
  const requests: Record<string, unknown>[] = []
  await page.addInitScript(() => {
    PublicKeyCredential.isConditionalMediationAvailable = async () => true
    navigator.credentials.get = async (options) => {
      if (options?.mediation !== 'conditional') throw new Error('Unexpected modal credential prompt')
      document.documentElement.dataset.autofill = 'conditional'
      return new Promise((_, reject) => {
        if (options.signal?.aborted) reject(new DOMException('Aborted', 'AbortError'))
        options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
    }
  })
  await page.route('**/auth/v1/passkeys/authentication/options', (route) => route.fulfill({ json: { challenge_id: 'test', options: { challenge: 'AQID', rpId: 'continua.info' } } }))
  await page.route('**/auth/v1/otp**', async (route) => {
    requests.push(route.request().postDataJSON())
    await route.fulfill({ json: {} })
  })
  await page.goto('https://continua.info/login?next=%2Fmy-relationships')
  await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('autocomplete', 'username webauthn')
  await expect(page.locator('input[type="password"], #login-name')).toHaveCount(0)
  await expect(page.locator('html')).toHaveAttribute('data-autofill', 'conditional')
  await expect(page.getByText('Waiting for your passkey…')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Cancel passkey request' })).toHaveCount(0)
  await page.getByLabel('Email', { exact: true }).fill('NEW-VISITOR@example.com')
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
  await expect(page.getByRole('status')).toContainText('Check your email')
  expect(requests).toHaveLength(1)
  expect(requests[0].email).toBe('new-visitor@example.com')
  expect(requests[0]).not.toHaveProperty('password')
  await page.getByRole('button', { name: 'Use a different email' }).click()
  await expect(page.getByLabel('Email', { exact: true })).toBeEnabled()
})

test('email times out with a retry even when Safari autofill ignores cancellation', async ({ page }) => {
  await page.addInitScript(() => {
    PublicKeyCredential.isConditionalMediationAvailable = async () => true
    navigator.credentials.get = async () => new Promise(() => {})
  })
  await page.route('**/auth/v1/passkeys/authentication/options', (route) => route.fulfill({ json: { challenge_id: 'test', options: { challenge: 'AQID', rpId: 'continua.info' } } }))
  let release: () => void = () => {}
  const held = new Promise<void>((resolve) => { release = resolve })
  await page.route('**/auth/v1/otp**', async (route) => { await held; await route.fulfill({ json: {} }).catch(() => {}) })
  try {
    await page.goto('https://continua.info/login')
    await page.clock.install()
    await page.getByLabel('Email', { exact: true }).fill('test@example.com')
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
    await page.clock.fastForward(15_001)
    await expect(page.getByRole('alert').filter({ hasText: 'took too long' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Email me a sign-in link' })).toBeEnabled()
    release()
    await page.unroute('**/auth/v1/otp**')
    await page.route('**/auth/v1/otp**', (route) => route.fulfill({ json: {} }))
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
    await expect(page.getByRole('status')).toContainText('Check your email')
  } finally { release() }
})

test('header sign-in preserves the current query and fragment', async ({ page }) => {
  await page.goto('https://continua.info/methodology?source=test#limits')
  await page.getByRole('link', { name: 'Sign in', exact: true }).first().click()
  await expect(page).toHaveURL('https://continua.info/login?next=%2Fmethodology%3Fsource%3Dtest%23limits')
})

test('unsupported browsers and failed email requests retain a clear recovery path', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'PublicKeyCredential', { value: undefined }) })
  await page.route('**/auth/v1/otp**', (route) => route.fulfill({ status: 429, json: { message: 'Rate limited' } }))
  await page.goto('https://continua.info/login')
  await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toHaveCount(0)
  await page.getByLabel('Email', { exact: true }).fill('test@example.com')
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'try again' })).toBeVisible()
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('test@example.com')
  await expect(page.getByRole('button', { name: 'Email me a sign-in link' })).toBeEnabled()
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 375 || width === 1440) await page.screenshot({ path: `/tmp/continua-login-review/${width}.png`, fullPage: true })
  }
})

test('missing credential is explained in app, with email immediately available', async ({ page }) => {
  await page.addInitScript(() => {
    PublicKeyCredential.isConditionalMediationAvailable = async () => false
    navigator.credentials.get = async () => { throw new DOMException('No credential', 'NotAllowedError') }
  })
  await page.route('**/auth/v1/passkeys/authentication/options', (route) => route.fulfill({ json: { challenge_id: 'test', options: { challenge: 'AQID', rpId: 'continua.info' } } }))
  await page.goto('https://continua.info/login')
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'sign in by email' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Email me a sign-in link' })).toBeEnabled()
})
