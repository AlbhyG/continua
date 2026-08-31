import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_CONTACTS_COOKIE } from '@/lib/admin/contacts-auth'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const requestedNext = String(formData.get('next') || '')
  const nextPath = requestedNext.startsWith('/admin/')
    ? requestedNext
    : '/admin/contacts'
  const response = NextResponse.redirect(new URL(nextPath, request.url), {
    status: 303,
  })
  response.cookies.set(ADMIN_CONTACTS_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
