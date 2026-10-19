'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type ProfileState =
  | { success: true; message: string }
  | { success: false; message: string }
  | null

const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a name.')
  .max(60, 'Please keep your name under 60 characters.')
  .regex(/^[^\r\n<>]+$/, 'Please enter your name on one line.')

// The name other people see, for example in a comparison. Updates both the
// account's own person record (what comparisons show) and the contact record.
export async function updateDisplayName(
  _previousState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Please sign in again.' }

  const parsed = displayNameSchema.safeParse(formData.get('name') ?? '')
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Please check your name.' }
  }
  const name = parsed.data
  const now = new Date().toISOString()

  await supabase.rpc('ensure_current_user_records')
  const { error: personError } = await supabase
    .from('people')
    .update({ name, updated_at: now })
    .eq('owner_user_id', user.id)
    .eq('is_self', true)
  if (personError) {
    console.error('Display name update failed:', personError.message)
    return { success: false, message: 'Your name could not be saved.' }
  }

  const { error: contactError } = await supabase
    .from('contacts')
    .update({ name, updated_at: now })
    .eq('user_id', user.id)
  if (contactError) console.error('Contact name update failed:', contactError.message)

  revalidatePath('/my-info')
  revalidatePath('/compare/people')
  return { success: true, message: 'Saved.' }
}
