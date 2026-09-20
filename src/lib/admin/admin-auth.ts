import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminStatus =
  | { status: 'signed_out' }
  | { status: 'not_admin'; email: string | null }
  | { status: 'admin'; id: string; email: string | null }

// Real per-account admin check: the caller must be signed in through the
// normal site login (passkey or email link) AND their user id must be in
// admin_users. This replaces the old shared ADMIN_CONTACTS_PASSWORD cookie,
// which had no way to tell one admin's actions from another's.
export async function getAdminStatus(): Promise<AdminStatus> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { status: 'signed_out' }

  const admin = createAdminClient()
  if (!admin) return { status: 'not_admin', email: user.email ?? null }

  const { data } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return { status: 'not_admin', email: user.email ?? null }

  return { status: 'admin', id: user.id, email: user.email ?? null }
}

export async function requireAdmin() {
  const status = await getAdminStatus()
  if (status.status !== 'admin') {
    throw new Error('Admin access required')
  }
  return status
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminStatus()).status === 'admin'
}
