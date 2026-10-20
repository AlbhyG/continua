import { NextResponse, type NextRequest } from 'next/server'
import { requireUser, safeNextPath } from '@/lib/auth/current-user'

// Passkeys establish the browser session directly, without an OAuth code callback.
// Apply the same account setup and anonymous-result claiming as protected pages.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const next = safeNextPath(url.searchParams.get('next'))
  await requireUser(next)
  return NextResponse.redirect(new URL(next, url.origin))
}
