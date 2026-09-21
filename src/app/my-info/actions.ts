'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revokeShares } from '@/lib/quiz/shares'

export async function deleteAssessmentAction(formData: FormData) {
  const resultId = Number(formData.get('result_id'))
  if (!Number.isSafeInteger(resultId) || resultId < 1) {
    throw new Error('Invalid assessment result')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be signed in to delete an assessment')
  }

  const { error } = await supabase
    .from('quiz_results')
    .delete()
    .eq('id', resultId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Could not delete assessment: ${error.message}`)
  }

  revalidatePath('/my-info')
}

export async function stopSharingAction(formData: FormData) {
  const resultId = Number(formData.get('result_id'))
  if (!Number.isSafeInteger(resultId) || resultId < 1) {
    throw new Error('Invalid assessment result')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be signed in to stop sharing an assessment')
  }

  // Confirm the result belongs to this account before touching its share links.
  const { data: owned } = await supabase
    .from('quiz_results')
    .select('id')
    .eq('id', resultId)
    .eq('user_id', user.id)
    .single()
  if (!owned) {
    throw new Error('Assessment not found')
  }

  const admin = createAdminClient()
  if (!admin || !(await revokeShares(admin, resultId))) {
    throw new Error('Could not turn off the shared link')
  }

  revalidatePath('/my-info')
}
