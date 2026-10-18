export async function requestEmailLink(email: string, callback: string, signal: AbortSignal, captchaToken?: string | null) {
  // Token-hash verification at the callback works across devices and needs no
  // browser-local PKCE verifier or auth storage lock. Supabase still applies
  // its normal per-address, per-IP, and project email limits.
  const endpoint = new URL('/auth/v1/otp', process.env.NEXT_PUBLIC_SUPABASE_URL!)
  endpoint.searchParams.set('redirect_to', callback)
  const response = await fetch(endpoint, {
    method: 'POST', signal,
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      create_user: true,
      // Required once CAPTCHA protection is on in Supabase (Turnstile).
      ...(captchaToken ? { gotrue_meta_security: { captcha_token: captchaToken } } : {}),
    }),
  })
  if (!response.ok) {
    if (response.status === 429) throw new Error('Too many sign-in requests. Please wait a few minutes and try again.')
    const body = await response.json().catch(() => null) as { error_code?: string; msg?: string } | null
    if (body?.error_code === 'captcha_failed' || /captcha/i.test(body?.msg ?? '')) {
      throw new Error('We couldn’t confirm you’re not a bot. Please reload the page and try again.')
    }
    throw new Error('We couldn’t send the sign-in link. Please wait a moment and try again.')
  }
}
