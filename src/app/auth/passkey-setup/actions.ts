'use server'

import { requireUser } from '@/lib/auth/current-user'

export async function consumePasskeySetupOffer() {
  const { supabase, user } = await requireUser('/my-info')
  if (!user.email_confirmed_at || user.is_anonymous) return false
  const { data: passkeys, error: listError } = await supabase.auth.passkey.list()
  // Optional onboarding must never prevent an otherwise valid sign-in.
  if (listError || passkeys?.length) return false
  const { data, error } = await supabase.rpc('consume_passkey_setup_offer')
  if (error) { console.error('Could not record passkey setup offer:', error.code); return false }
  return data === true
}
