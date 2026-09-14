import { test, expect } from '@playwright/test'

const baseURL = process.env.CONTINUA_TEST_BASE_URL
test.skip(!baseURL, 'Set CONTINUA_TEST_BASE_URL to a running local or deployed site')

test('methodology explains current behavior and labels future safeguards honestly', async ({ page }) => {
  await page.goto(`${baseURL}/methodology`)
  await expect(page.getByRole('heading', { name: 'Methodology & Limitations', exact: true })).toBeVisible()
  await expect(page.getByText(/pending legal review, not legal sign-off/)).toBeVisible()
  await expect(page.getByText(/has not been clinically validated/)).toBeVisible()
  await expect(page.getByText(/current questionnaire maps responses onto scores from 1 to 10/)).toBeVisible()
  await expect(page.getByText(/whole-profile AI descriptions are not available yet/)).toBeVisible()
  await expect(page.getByText(/Do not assume the existing individual-result sharing control/)).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Site information' }).getByRole('link', { name: 'Methodology & Limitations' })).toHaveAttribute('href', '/methodology')
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
})

test('assessment and result disclosures both link to the complete explanation', async ({ page }) => {
  await page.goto(`${baseURL}/quiz`)
  const disclosure = page.getByRole('complementary', { name: 'Assessment limitations' })
  await expect(disclosure.getByRole('link', { name: 'Methodology & Limitations' })).toHaveAttribute('href', '/methodology')
  await expect(disclosure).toContainText('not therapy or a clinical assessment')
  // Synthetic browser-local fixture only; no account, real assessment, or DB write.
  await page.addInitScript(() => {
    sessionStorage.setItem('result_methodology-test', JSON.stringify({
      scores: { social_attunement: 5.5, empathy: 5.5, self_orientation: 5.5, conscientiousness: 5.5, agency: 5.5, reactivity: 5.5 },
      axisResults: [], shareLink: '/quiz/results/methodology-test',
    }))
  })
  await page.goto(`${baseURL}/quiz/results/methodology-test`)
  await expect(disclosure).toBeVisible()
  await disclosure.getByRole('link', { name: 'Methodology & Limitations' }).click()
  await expect(page).toHaveURL(`${baseURL}/methodology`)
})
