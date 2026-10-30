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

  revalidatePath('/my-continua')
  revalidatePath('/compare/people')
  return { success: true, message: 'Saved.' }
}

// A small JPEG data URL (resized in the browser to 128 x 128), or null to
// remove the photo. Shown only to the account holder, in the header.
const PHOTO_PREFIX = 'data:image/jpeg;base64,'
const PHOTO_MAX = 60000

export async function updatePhoto(photo: string | null): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Please sign in again.' }
  if (photo !== null) {
    if (typeof photo !== 'string' || !photo.startsWith(PHOTO_PREFIX) || photo.length > PHOTO_MAX) {
      return { ok: false, message: 'That image could not be used. Please try another.' }
    }
    if (!/^[A-Za-z0-9+/=]+$/.test(photo.slice(PHOTO_PREFIX.length))) {
      return { ok: false, message: 'That image could not be used. Please try another.' }
    }
  }
  await supabase.rpc('ensure_current_user_records')
  const { error } = await supabase
    .from('people')
    .update({ photo, updated_at: new Date().toISOString() })
    .eq('owner_user_id', user.id)
    .eq('is_self', true)
  if (error) {
    console.error('Photo update failed:', error.message)
    return { ok: false, message: 'Your photo could not be saved.' }
  }
  revalidatePath('/my-continua')
  return { ok: true, message: photo ? 'Photo saved.' : 'Photo removed.' }
}

// Which pronoun is used when other people's questions are written about you.
export async function updatePronoun(pronoun: string): Promise<{ ok: boolean; message: string }> {
  if (pronoun !== 'he' && pronoun !== 'she' && pronoun !== 'they') {
    return { ok: false, message: 'Please choose he, she, or they.' }
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Please sign in again.' }
  await supabase.rpc('ensure_current_user_records')
  const { error } = await supabase
    .from('people')
    .update({ pronoun, updated_at: new Date().toISOString() })
    .eq('owner_user_id', user.id)
    .eq('is_self', true)
  if (error) {
    console.error('Pronoun update failed:', error.message)
    return { ok: false, message: 'Could not save.' }
  }
  return { ok: true, message: 'Saved.' }
}
