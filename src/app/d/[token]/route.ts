import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { bookLabel } from '@/lib/pdf/links'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function notFound() {
  return new Response('Link not found or no longer available.', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    if (!token) return notFound()

    const supabase = createAdminClient()
    if (!supabase) {
      return new Response('Server not configured.', { status: 500 })
    }

    // select('*') so this keeps working whether or not migration 00022
    // (recipient / revoked_at columns) has been applied yet.
    const { data: link, error } = await supabase
      .from('pdf_links')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !link) return notFound()
    if (link.revoked_at) return notFound()

    if (link.label === 'proposal') {
      // Record the open; never block the download if logging fails.
      const { error: openError } = await supabase.from('pdf_link_opens').insert({
        token,
        user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
      })
      if (openError) console.error('Proposal open log error:', openError.message)
    }

    const { data: sourcePdf, error: sourceError } = await supabase.storage
      .from('books')
      .download(link.file_path)

    if (sourceError || !sourcePdf) return notFound()

    const label = link.label || bookLabel(link.file_path)
    const body = new Uint8Array(await sourcePdf.arrayBuffer())

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="continua-${label}.pdf"`,
        'Content-Length': body.byteLength.toString(),
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch (err) {
    console.error('PDF link route error:', err)
    return new Response('Something went wrong.', { status: 500 })
  }
}
