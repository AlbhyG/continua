import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth/current-user'
import { emailReturnPath } from '@/lib/auth/return-path'

function redirectWithoutToken(destination: URL) {
  const response = NextResponse.redirect(destination)
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const nextPath = url.searchParams.has('next')
    ? safeNextPath(url.searchParams.get('next'))
    : emailReturnPath(url.searchParams.get('return_to'))

  if (code || (tokenHash && url.searchParams.get('type') === 'email')) {
    const supabase = await createClient()
    const { error } = tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
      : await supabase.auth.exchangeCodeForSession(code!)
    if (!error) {
      await supabase.rpc('ensure_current_user_records')
      const setup = new URL('/auth/passkey-setup', url.origin)
      setup.searchParams.set('next', nextPath)
      return redirectWithoutToken(setup)
    }
  }

  const login = new URL('/login', url.origin)
  login.searchParams.set('error', 'callback')
  login.searchParams.set('next', nextPath)
  return redirectWithoutToken(login)
}
