import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { encryptPdf } from '@/lib/pdf/encrypt'
import { chapterStoragePath } from '@/lib/pdf/chapter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PDF_OWNER_PASSWORD =
  process.env.PDF_OWNER_PASSWORD || 'change-this-owner-password'

// One-click book sample for signed-in readers. The account's verified email
// is already known, so there is no form: the PDF is encrypted with the same
// password scheme as emailed copies (the lowercase email address) and
// returned directly. Signed-out visitors are sent to sign in, then back here.
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email?.trim().toLowerCase()
  if (!user || !email || !user.email_confirmed_at) {
    const login = new URL('/login', request.nextUrl.origin)
    login.searchParams.set('next', '/sample')
    return NextResponse.redirect(login)
  }

  const admin = createAdminClient()
  if (!admin) {
    return new Response('The sample is not available right now.', { status: 503 })
  }

  const filePath = chapterStoragePath()
  const { data: sourcePdf, error: sourceError } = await admin.storage
    .from('books')
    .download(filePath)
  if (sourceError || !sourcePdf) {
    console.error('Signed-in sample: source PDF missing', filePath, sourceError?.message)
    return new Response('The sample is not available right now.', { status: 503 })
  }

  const encrypted = await encryptPdf({
    input: new Uint8Array(await sourcePdf.arrayBuffer()),
    userPassword: email,
    ownerPassword: PDF_OWNER_PASSWORD,
  })

  // Not logged in contact_deliveries: its delivery_method only allows 'email' or
  // 'manual', and recording this as either would misdescribe it.

  const body = new Uint8Array(encrypted)
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="continua-first-chapter.pdf"',
      'Content-Length': body.byteLength.toString(),
      'Cache-Control': 'no-store',
    },
  })
}
