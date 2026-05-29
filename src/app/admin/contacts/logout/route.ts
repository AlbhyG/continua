import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_CONTACTS_COOKIE } from '@/lib/admin/contacts-auth'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/admin/contacts', request.url), {
    status: 303,
  })
  response.cookies.set(ADMIN_CONTACTS_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin/contacts',
    maxAge: 0,
  })
  return response
}
