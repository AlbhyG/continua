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
          return
        }
        // The header's "See Results" link is driven by a locally cached
        // latest_result_id. If we're deleting that same result, clear it so
        // the header doesn't keep linking to a result that no longer exists.
        if (window.localStorage.getItem('latest_result_id') === String(resultId)) {
          window.localStorage.removeItem('latest_result_id')
          window.dispatchEvent(new Event('continua:latest-result'))
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
