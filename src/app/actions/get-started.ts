'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStartedAction(data: {
  name: string
  email?: string
  phone?: string
  roles: string[]
}): Promise<{ success: boolean; error?: string }> {
  const { name, email, phone, roles } = data

  if (!name.trim()) {
    return { success: false, error: 'Name is required' }
  }
  if (!email?.trim() && !phone?.trim()) {
    return { success: false, error: 'Email or phone is required' }
  }

  try {
    const supabase = await createClient()

    if (email?.trim()) {
      const { error } = await supabase.from('contacts').upsert(
        {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone?.trim() || null,
          interest_roles: roles.length > 0 ? roles : null,
          signed_up_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      if (error) {
        console.error('Get started DB error:', JSON.stringify(error, null, 2))
        return { success: false, error: 'Something went wrong. Please try again.' }
      }
    } else {
      // Phone only — insert without email unique constraint
      const { error } = await supabase.from('contacts').insert({
        email: null,
        name: name.trim(),
        phone: phone?.trim() || null,
        interest_roles: roles.length > 0 ? roles : null,
        signed_up_at: new Date().toISOString(),
      })
      if (error) {
        console.error('Get started DB error:', JSON.stringify(error, null, 2))
        return { success: false, error: 'Something went wrong. Please try again.' }
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Get started unexpected error:', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
