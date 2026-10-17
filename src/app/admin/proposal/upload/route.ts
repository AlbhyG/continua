import { NextResponse, type NextRequest } from 'next/server'
import { hasAdminContactsSession } from '@/lib/admin/contacts-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { PROPOSAL_FILE_PATH } from '@/lib/pdf/proposal'

export const runtime = 'nodejs'

function back(request: NextRequest, status: string) {
  const url = new URL('/admin/proposal', request.url)
  url.searchParams.set('upload', status)
  return NextResponse.redirect(url, { status: 303 })
}

// Replaces the proposal PDF. Vercel caps request bodies at about 4.5 MB.
export async function POST(request: NextRequest) {
  if (!(await hasAdminContactsSession())) return back(request, 'auth')

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return back(request, 'missing')
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return back(request, 'type')
  }

  const supabase = createAdminClient()
  if (!supabase) return back(request, 'config')

  const { error } = await supabase.storage
    .from('books')
    .upload(PROPOSAL_FILE_PATH, new Uint8Array(await file.arrayBuffer()), {
      contentType: 'application/pdf',
      upsert: true,
    })
  if (error) {
    console.error('Proposal upload error:', error.message)
    return back(request, 'error')
  }
  return back(request, 'ok')
}
