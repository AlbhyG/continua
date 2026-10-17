'use server'

import { revalidatePath } from 'next/cache'
import { hasAdminContactsSession } from '@/lib/admin/contacts-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePdfLinkToken } from '@/lib/pdf/links'
import { PROPOSAL_FILE_PATH, PROPOSAL_LABEL } from '@/lib/pdf/proposal'

async function adminClient() {
  if (!(await hasAdminContactsSession())) throw new Error('Not signed in.')
  const supabase = createAdminClient()
  if (!supabase) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.')
  return supabase
}

export async function createProposalLink(formData: FormData) {
  const recipient = String(formData.get('recipient') || '').trim().slice(0, 200)
  const note = String(formData.get('note') || '').trim().slice(0, 500)
  if (!recipient) throw new Error('Enter who the link is for.')

  const supabase = await adminClient()
  const { error } = await supabase.from('pdf_links').insert({
    token: generatePdfLinkToken(),
    file_path: PROPOSAL_FILE_PATH,
    user_password: '',
    label: PROPOSAL_LABEL,
    recipient,
    note: note || null,
  })
  if (error) throw new Error(`Could not create the link: ${error.message}`)
  revalidatePath('/admin/proposal')
}

export async function setProposalLinkRevoked(formData: FormData) {
  const token = String(formData.get('token') || '')
  const revoke = formData.get('revoke') === '1'
  if (!token) return

  const supabase = await adminClient()
  const { error } = await supabase
    .from('pdf_links')
    .update({ revoked_at: revoke ? new Date().toISOString() : null })
    .eq('token', token)
    .eq('label', PROPOSAL_LABEL)
  if (error) throw new Error(`Could not update the link: ${error.message}`)
  revalidatePath('/admin/proposal')
}
