'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidTokenFormat } from '@/lib/tokens/generate'

type VerifyEmailState = {
  success?: boolean
  error?: string
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

    const supabase = await createClient()

    // Query contact by verification token
    const { data: contact, error: queryError } = await supabase
      .from('contacts')
      .select('id, verification_token_expires_at')
      .eq('verification_token', token)
      .single()

    if (queryError || !contact) {
      return {
        error: 'This verification link is invalid or has already been used. Please request a new Book download to receive a fresh link.',
      }
    }

    // Check if token is expired
    const expiresAt = new Date(contact.verification_token_expires_at)
    const now = new Date()

    if (expiresAt < now) {
      return {
        error: 'This verification link has expired. Please request a new Book download to receive a fresh link.',
      }
    }

    // Mark email as verified and clear token
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq('id', contact.id)

    if (updateError) {
      console.error('Verify email update error:', JSON.stringify(updateError, null, 2))
      return {
        error: 'Something went wrong. Please try again.',
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Verify email unexpected error:', err)
    return {
      error: 'Something went wrong. Please try again.',
    }
  }
}
