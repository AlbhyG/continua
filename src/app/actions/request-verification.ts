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

    // Try to insert new contact with verification token
    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert({
        email,
        name,
        verification_token: token,
        verification_token_expires_at: expiresAt,
      })
      .select('id')
      .single()

    let contactId: string

    if (insertError) {
      // Unique violation (duplicate email) — update existing contact
      if (insertError.code === '23505') {
        const { data: updateData, error: updateError } = await supabase
          .from('contacts')
          .update({
            verification_token: token,
            verification_token_expires_at: expiresAt,
          })
          .eq('email', email)
          .select('id')
          .single()

        if (updateError) {
          console.error('Update contact error:', JSON.stringify(updateError, null, 2))
          return {
            errors: { form: ['Something went wrong. Please try again.'] },
          }
        }

        contactId = updateData.id
      } else {
        console.error('Insert contact error:', JSON.stringify(insertError, null, 2))
        return {
          errors: { form: ['Something went wrong. Please try again.'] },
        }
      }
    } else {
      contactId = insertData.id
    }

    // Insert book request (catch duplicate silently)
    await supabase
      .from('book_requests')
      .insert({
        contact_id: contactId,
        book_type,
      })
      .then(({ error }) => {
        // Ignore duplicate key violations (user already requested this book)
        if (error && error.code !== '23505') {
          console.error('Book request insert error:', JSON.stringify(error, null, 2))
        }
      })

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
