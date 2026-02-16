'use server'

import { signupSchema } from '@/lib/validations/signup'
import { createClient } from '@/lib/supabase/server'

export type SignupState = {
  errors?: {
    name?: string[]
    email?: string[]
    form?: string[]
  }
  success?: boolean
} | null

export async function signupAction(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const validatedFields = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email } = validatedFields.data

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('contacts')
      .upsert(
        {
          email,
          name,
          signed_up_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Signup database error:', error)
      return {
        errors: { form: ['Something went wrong. Please try again.'] },
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Signup unexpected error:', err)
    return {
      errors: { form: ['Something went wrong. Please try again.'] },
    }
  }
}
