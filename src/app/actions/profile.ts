'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const VALID_ROLES = ['Agent', 'Publisher', 'Therapist', 'Interested Reader'] as const

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  phone: z.string().trim().max(40),
  roles: z.array(z.enum(VALID_ROLES)),
})

export type ProfileState =
  | { success: true; message: string }
  | { success: false; message: string }
  | null

export async function updateProfile(
  _previousState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Please sign in again.' }
  }

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') ?? '',
    roles: formData.getAll('roles'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Please check your information.',
    }
  }

  const { name, phone, roles } = parsed.data
  const { error } = await supabase
    .from('contacts')
    .update({
      name,
      phone: phone || null,
      interest_roles: roles,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Profile update failed:', error.message)
    return { success: false, message: 'Your profile could not be saved.' }
  }

  const { error: personError } = await supabase
    .from('people')
    .update({
      name,
      email: user.email?.toLowerCase() ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('owner_user_id', user.id)
    .eq('is_self', true)

  if (personError) {
    console.error('Self person update failed:', personError.message)
  }

  revalidatePath('/my-info')
  revalidatePath('/my-relationships')
  return { success: true, message: 'Profile saved.' }
}
