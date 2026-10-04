export async function requestEmailLink(email: string, callback: string, signal: AbortSignal) {
  // Token-hash verification at the callback works across devices and needs no
  // browser-local PKCE verifier or auth storage lock. Supabase still applies
  // its normal per-address, per-IP, and project email limits.
  const endpoint = new URL('/auth/v1/otp', process.env.NEXT_PUBLIC_SUPABASE_URL!)
  endpoint.searchParams.set('redirect_to', callback)
  const response = await fetch(endpoint, {
    method: 'POST', signal,
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, create_user: true }),
  })
  if (!response.ok) {
    if (response.status === 429) throw new Error('Too many sign-in requests. Please wait a few minutes and try again.')
    throw new Error('We couldn’t send the sign-in link. Please wait a moment and try again.')
  }
}
