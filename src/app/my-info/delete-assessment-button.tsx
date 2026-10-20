'use client'

import { useFormStatus } from 'react-dom'
import { deleteAssessmentAction } from './actions'

export default function DeleteAssessmentButton({ resultId }: { resultId: number }) {
  return (
    <form
      action={deleteAssessmentAction}
      onSubmit={(event) => {
        if (!window.confirm('Delete this assessment permanently? This cannot be undone.')) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="result_id" value={resultId} />
      <DeleteButton />
    </form>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete assessment'}
    </button>
  )
}
