'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateVerificationToken } from '@/lib/tokens/generate'
import { sendVerificationEmail } from '@/lib/email/send-verification'

export type RequestVerificationState = {
  errors?: { name?: string[]; email?: string[]; form?: string[] }
  success?: boolean
} | null

const requestVerificationSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((e) => e.trim().toLowerCase()),
  book_type: z.enum(['publishers', 'agents', 'therapists']),
})

export async function requestVerificationAction(
  prevState: RequestVerificationState,
  formData: FormData
): Promise<RequestVerificationState> {
  // Validate inputs
  const validatedFields = requestVerificationSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    book_type: formData.get('book_type'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, book_type } = validatedFields.data

  try {
    const supabase = await createClient()

    // Generate verification token and expiry (24 hours from now)
    const token = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Upsert contact and book request via RPC (SECURITY DEFINER bypasses RLS).
    // Direct INSERT/UPDATE via PostgREST fails when an existing contact has
    // email_verified=false AND verification_token=NULL — neither SELECT policy
    // matches, so PostgREST can't find the row to update.
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'upsert_contact_verification',
      {
        p_email: email,
        p_name: name,
        p_token: token,
        p_expires_at: expiresAt,
        p_book_type: book_type,
      }
    )

    if (rpcError) {
      console.error('Upsert contact RPC error:', JSON.stringify(rpcError, null, 2))
      return {
        errors: { form: ['Something went wrong. Please try again.'] },
      }
    }

    // Send verification email
    await sendVerificationEmail({
      to: email,
      name,
      token,
    })

    // Always return success (privacy-safe response)
    return { success: true }
  } catch (err) {
    console.error('Request verification unexpected error:', err)
    return {
      errors: { form: ['Something went wrong. Please try again.'] },
    }
  }
}
