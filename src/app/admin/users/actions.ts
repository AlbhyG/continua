'use server'

import { revalidatePath } from 'next/cache'
import { getAdminStatus } from '@/lib/admin/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

// Deletes a user account and everything tied to it, for cleaning up test
// accounts. auth.users -> people/groups/group_members cascade automatically
// (see supabase/migrations/00016), but quiz_results.user_id and
// contacts.user_id are ON DELETE SET NULL, not CASCADE, so left alone they'd
// survive as orphaned rows instead of actually going away. Delete those
// explicitly first.
export async function deleteUserAction(formData: FormData) {
  const adminStatus = await getAdminStatus()
  if (adminStatus.status !== 'admin') {
    throw new Error('Admin access required')
  }

  const userId = String(formData.get('user_id') || '')
  if (!userId) {
    throw new Error('Missing user id')
  }

  const admin = createAdminClient()
  if (!admin) {
    throw new Error('Admin client unavailable')
  }

  const { data: adminRow } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (adminRow) {
    throw new Error(
      'This account is an admin. Remove it from admin_users in Supabase before deleting it, to avoid locking out admin access.'
    )
  }

  await admin.from('quiz_results').delete().eq('user_id', userId)
  await admin.from('contacts').delete().eq('user_id', userId)

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/assessments')
  revalidatePath('/admin/contacts')
}

// Returns a one-click sign-in link for a test email, creating the account if
// it doesn't exist yet. Meant for playing different people (t1@continua.info,
// t2@continua.info, ...) to test how family/friend/team groups map, without
// needing a real inbox at that address. Open the link in a private/incognito
// window to sign in as that identity while keeping your own admin session
// intact in the main window.
export async function createTestSignInLinkAction(
  email: string
): Promise<{ link: string } | { error: string }> {
  const adminStatus = await getAdminStatus()
  if (adminStatus.status !== 'admin') {
    return { error: 'Admin access required' }
  }

  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !trimmed.includes('@')) {
    return { error: 'Enter a valid email address' }
  }

  const admin = createAdminClient()
  if (!admin) {
    return { error: 'Admin client unavailable' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const redirectTo = siteUrl
    ? `${siteUrl.replace(/\/$/, '')}/auth/callback?next=${encodeURIComponent('/my-info')}`
    : undefined

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: trimmed,
    options: redirectTo ? { redirectTo } : undefined,
  })

  if (error || !data?.properties?.action_link) {
    return { error: error?.message || 'Could not generate a sign-in link' }
  }

  return { link: data.properties.action_link }
}
