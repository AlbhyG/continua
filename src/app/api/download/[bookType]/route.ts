import { NextRequest, NextResponse } from 'next/server'

// Old bookmarks carried only an email address, which is not authorization.
// Send visitors to the current chapter request flow without forwarding that PII.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url), 303)
}
