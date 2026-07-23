'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string
  initialError: string | null
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const callback = new URL('/auth/callback', window.location.origin)
    callback.searchParams.set('next', nextPath)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: callback.toString(),
        data: name.trim() ? { name: name.trim() } : undefined,
      },
    })

    setSubmitting(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-xl bg-white/70 p-5" role="status">
        <h2 className="font-bold text-foreground">Check your email</h2>
        <p className="mt-1 text-sm text-foreground/70">
          We sent a sign-in link to <strong>{email.trim()}</strong>. It may take
          a minute to arrive.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-semibold text-accent underline underline-offset-2"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="login-name" className="mb-1 block text-sm font-semibold">
          Name <span className="font-normal text-foreground/50">(new accounts)</span>
        </label>
        <input
          id="login-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={100}
          className="w-full rounded-xl border border-black/10 bg-white/85 px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-semibold">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white/85 px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-accent px-5 py-3 font-bold text-white transition hover:bg-accent/85 disabled:opacity-60"
      >
        {submitting ? 'Sending link…' : 'Email me a sign-in link'}
      </button>
    </form>
  )
}
