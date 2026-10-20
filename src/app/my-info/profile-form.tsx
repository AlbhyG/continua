'use client'

import { useActionState } from 'react'
import { updateProfile, type ProfileState } from '@/app/actions/profile'

const ROLES = ['Agent', 'Publisher', 'Therapist', 'Interested Reader'] as const

export default function ProfileForm({
  profile,
}: {
  profile: {
    name: string
    email: string
    phone: string
    roles: string[]
  }
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    null
  )

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-semibold">
            Name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            required
            maxLength={100}
            defaultValue={profile.name}
            className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1 block text-sm font-semibold">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={profile.email}
            readOnly
            className="w-full rounded-xl border border-black/5 bg-black/5 px-4 py-3 text-foreground/60"
          />
        </div>
      </div>
      <div>
        <label htmlFor="profile-phone" className="mb-1 block text-sm font-semibold">
          Phone
        </label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          maxLength={40}
          defaultValue={profile.phone}
          className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">I’m interested as a</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLES.map((role) => (
            <label
              key={role}
              className="flex items-center gap-2 rounded-lg bg-white/55 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name="roles"
                value={role}
                defaultChecked={profile.roles.includes(role)}
                className="rounded border-black/20"
              />
              {role}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-5 py-2.5 font-bold text-white transition hover:bg-accent/85 disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save profile'}
        </button>
        {state && (
          <p
            className={`text-sm ${state.success ? 'text-green-800' : 'text-red-700'}`}
            role="status"
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
