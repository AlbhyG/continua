'use server'

import { requireUser } from '@/lib/auth/current-user'

// Whether to offer "add a passkey for this device" after an email sign-in.
// Signing in by email already means this device didn't use a passkey, so the
// offer no longer depends on whether the account has passkeys elsewhere; the
// browser itself remembers a "not now" (see device-memory). `elsewhere` only
// changes the wording.
export async function passkeySetupEligibility(): Promise<{ eligible: boolean; elsewhere: boolean }> {
  const { supabase, user } = await requireUser('/my-continua')
  if (!user.email_confirmed_at || user.is_anonymous) return { eligible: false, elsewhere: false }
  const { data: passkeys, error } = await supabase.auth.passkey.list()
  // Optional onboarding must never prevent an otherwise valid sign-in.
  if (error) return { eligible: true, elsewhere: false }
  return { eligible: true, elsewhere: (passkeys?.length ?? 0) > 0 }
}
