import { NextResponse, type NextRequest } from 'next/server'
import {
  ADMIN_CONTACTS_COOKIE,
  getAdminContactsToken,
} from '@/lib/admin/contacts-auth'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const password = String(formData.get('password') || '')
  const expectedPassword = process.env.ADMIN_CONTACTS_PASSWORD
  const token = getAdminContactsToken()

  if (!expectedPassword || !token || password !== expectedPassword) {
    return NextResponse.redirect(new URL('/admin/contacts?error=1', request.url), {
      status: 303,
    })
  }

  const response = NextResponse.redirect(new URL('/admin/contacts', request.url), {
    status: 303,
  })
  response.cookies.set(ADMIN_CONTACTS_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin/contacts',
    maxAge: 60 * 60 * 12,
  })

  return response
}
