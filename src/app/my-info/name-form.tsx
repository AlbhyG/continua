'use client'

import { useActionState } from 'react'
import { updateDisplayName, type ProfileState } from '@/app/actions/profile'

// The name other people see when you compare results with them.
export default function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateDisplayName, null)

  return (
    <form action={action} className="glass-card mt-8 p-5">
      <label htmlFor="display-name" className="block text-sm font-semibold">
        Your name
      </label>
      <p className="mt-1 text-sm text-foreground/70">
        This is how you appear to people you compare results with.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          id="display-name"
          name="name"
          type="text"
          required
          maxLength={60}
          defaultValue={name}
          autoComplete="name"
          className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-white disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
      {state && (
        <p className={`mt-2 text-sm ${state.success ? 'text-green-800' : 'text-red-700'}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  )
}
