'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidTokenFormat } from '@/lib/tokens/generate'
import { createAdminClient } from '@/lib/supabase/admin'
import { chapterStoragePath } from '@/lib/pdf/chapter'
import { verifiedDownload } from '@/lib/pdf/verified-download'

type VerifyEmailState = {
  success?: boolean
  error?: string
  downloadUrl?: string
  password?: string
} | null

export async function verifyEmailAction(
  prevState: VerifyEmailState,
  formData: FormData
): Promise<VerifyEmailState> {
  try {
    const token = formData.get('token')

    // Validate token is a string
    if (typeof token !== 'string') {
      return {
        error: 'This verification link is invalid or has already been used. Please request a new Book download to receive a fresh link.',
      }
    }

    // Validate token format
    if (!isValidTokenFormat(token)) {
      return {
        error: 'This verification link is invalid or has already been used. Please request a new Book download to receive a fresh link.',
      }
    }

    // Check delivery configuration before consuming the one-use verification token.
    const admin = createAdminClient()
    if (!admin) return { error: 'Downloads are temporarily unavailable. Please try again later.' }
    const supabase = await createClient()

    // Call the SECURITY DEFINER function to verify atomically
    // This bypasses RLS so we can clear the token in the same operation
    const { data, error: rpcError } = await supabase.rpc('verify_email_token', {
      token_value: token,
    })

    if (rpcError) {
      console.error('Verify email RPC error:', rpcError)
      return {
        error: 'Something went wrong. Please try again.',
      }
    }

    return verifiedDownload(data, chapterStoragePath(), async (link) => {
      const { error } = await admin.from('pdf_links').insert(link)
      if (error) throw error
    })
  } catch (err) {
    console.error('Verify email unexpected error:', err)
    return {
      error: 'Something went wrong. Please try again.',
    }
  }
}
