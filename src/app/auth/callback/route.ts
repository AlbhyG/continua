import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth/current-user'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextPath = safeNextPath(url.searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      await supabase.rpc('ensure_current_user_records')
      return NextResponse.redirect(new URL(nextPath, url.origin))
    }
  }

  const login = new URL('/login', url.origin)
  login.searchParams.set('error', 'callback')
  login.searchParams.set('next', nextPath)
  return NextResponse.redirect(login)
}
