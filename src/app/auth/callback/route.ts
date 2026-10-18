import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth/current-user'
import { emailReturnPath } from '@/lib/auth/return-path'

function redirectWithoutToken(destination: URL, status: 302 | 303 = 302) {
  const response = NextResponse.redirect(destination, status)
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}

function finishSignIn(error: unknown, origin: string, nextPath: string, status: 302 | 303) {
  if (!error) {
    const setup = new URL('/auth/passkey-setup', origin)
    setup.searchParams.set('next', nextPath)
    return redirectWithoutToken(setup, status)
  }
  const login = new URL('/login', origin)
  login.searchParams.set('error', 'callback')
  login.searchParams.set('next', nextPath)
  return redirectWithoutToken(login, status)
}

// GET: an email link was opened. Email security scanners (Outlook Safe Links
// and similar) open every link before the person does, so a GET must never use
// up the one-time token. Send the visitor to a confirm page instead; the token
// is only spent when they press its button (the POST below).
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const nextPath = url.searchParams.has('next')
    ? safeNextPath(url.searchParams.get('next'))
    : emailReturnPath(url.searchParams.get('return_to'))

  if (tokenHash && url.searchParams.get('type') === 'email') {
    const confirm = new URL('/auth/confirm', url.origin)
    confirm.searchParams.set('token_hash', tokenHash)
    confirm.searchParams.set('next', nextPath)
    return redirectWithoutToken(confirm)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) await supabase.rpc('ensure_current_user_records')
    return finishSignIn(error, url.origin, nextPath, 302)
  }

  return finishSignIn(new Error('missing token'), url.origin, nextPath, 302)
}

// POST: the person pressed "Finish signing in" on the confirm page.
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const form = await request.formData()
  const tokenHash = form.get('token_hash')
  const nextPath = safeNextPath(typeof form.get('next') === 'string' ? (form.get('next') as string) : null)

  if (typeof tokenHash !== 'string' || !tokenHash) {
    return finishSignIn(new Error('missing token'), url.origin, nextPath, 303)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
  if (!error) await supabase.rpc('ensure_current_user_records')
  return finishSignIn(error, url.origin, nextPath, 303)
}
