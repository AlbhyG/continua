'use client'

import { useFormStatus } from 'react-dom'
import { deleteUserAction } from './actions'

export default function DeleteUserButton({
  userId,
  name,
}: {
  userId: string
  name: string
}) {
  return (
    <form
      action={deleteUserAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Permanently delete ${name}'s account? This removes the account, their assessments, people, and groups. This cannot be undone.`
          )
        ) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="user_id" value={userId} />
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
      className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
