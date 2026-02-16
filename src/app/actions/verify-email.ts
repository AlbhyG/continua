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

    const result = data as { status: string }

    if (result.status === 'invalid') {
      return {
        error: 'This verification link is invalid or has already been used. Please request a new Book download to receive a fresh link.',
      }
    }

    if (result.status === 'expired') {
      return {
        error: 'This verification link has expired. Please request a new Book download to receive a fresh link.',
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
