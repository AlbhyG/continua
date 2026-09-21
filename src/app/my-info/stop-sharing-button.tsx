'use client'

import { useFormStatus } from 'react-dom'
import { stopSharingAction } from './actions'

export default function StopSharingButton({ resultId }: { resultId: number }) {
  return (
    <form
      action={stopSharingAction}
      onSubmit={(event) => {
        if (!window.confirm('Turn off this shared link? Anyone who has it will no longer be able to open it.')) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="result_id" value={resultId} />
      <StopButton />
    </form>
  )
}

function StopButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg px-3 py-2 text-xs font-semibold text-foreground/70 underline underline-offset-4 transition hover:bg-foreground/5 disabled:cursor-wait disabled:opacity-50"
    >
      {pending ? 'Turning off…' : 'Stop sharing link'}
    </button>
  )
}
