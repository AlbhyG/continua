'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isPronoun } from '@/lib/observer/pronouns'

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

  revalidatePath('/my-continua')
  revalidatePath('/compare/people')
  return { success: true, message: 'Saved.' }
}

// How statements about you read when other people describe you ("How others
// see you"): he, she or they. Saved on your own person record.
export async function updatePronoun(pronoun: string): Promise<ProfileState> {
  if (!isPronoun(pronoun)) return { success: false, message: 'Please choose one of the options.' }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Please sign in again.' }

  await supabase.rpc('ensure_current_user_records')
  const { error } = await supabase
    .from('people')
    .update({ pronoun, updated_at: new Date().toISOString() })
    .eq('owner_user_id', user.id)
    .eq('is_self', true)
  if (error) {
    console.error('Pronoun update failed:', error.message)
    return { success: false, message: 'Your choice could not be saved.' }
  }
  return { success: true, message: 'Saved.' }
}
