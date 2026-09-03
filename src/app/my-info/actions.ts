'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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
