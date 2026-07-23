import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function requireUser(returnTo: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`)
  }

  const { error } = await supabase.rpc('ensure_current_user_records')
  if (error) {
    console.error('Could not ensure user records:', error.message)
  }

  const anonymousToken = (await cookies()).get('anonymous_token')?.value
  if (anonymousToken) {
    const { error: claimError } = await supabase.rpc(
      'claim_anonymous_quiz_results',
      { p_token: anonymousToken }
    )
    if (claimError) {
      console.error('Could not claim anonymous quiz results:', claimError.message)
    }
  }

  return { supabase, user }
}

export function safeNextPath(value: string | null, fallback = '/my-info') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }
  return value
}
