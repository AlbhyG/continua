import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { encryptPdf } from '@/lib/pdf/encrypt'
import { bookLabel } from '@/lib/pdf/links'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PDF_OWNER_PASSWORD =
  process.env.PDF_OWNER_PASSWORD || 'change-this-owner-password'

function notFound() {
  return new Response('Link not found or no longer available.', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    if (!token) return notFound()

    const supabase = createAdminClient()
    if (!supabase) {
      return new Response('Server not configured.', { status: 500 })
    }

    const { data: link, error } = await supabase
      .from('pdf_links')
      .select('file_path, user_password, label')
      .eq('token', token)
      .single()

    if (error || !link) return notFound()

    const { data: sourcePdf, error: sourceError } = await supabase.storage
      .from('books')
      .download(link.file_path)

    if (sourceError || !sourcePdf) return notFound()

    const encrypted = await encryptPdf({
      input: new Uint8Array(await sourcePdf.arrayBuffer()),
      userPassword: link.user_password,
      ownerPassword: PDF_OWNER_PASSWORD,
    })

    const label = link.label || bookLabel(link.file_path)
    const body = new Uint8Array(encrypted)

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="continua-${label}.pdf"`,
        'Content-Length': body.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('PDF link route error:', err)
    return new Response('Something went wrong.', { status: 500 })
  }
}
