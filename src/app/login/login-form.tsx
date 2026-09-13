'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { canUsePasskeys, passkeyErrorMessage } from '@/lib/auth/passkeys'

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
  const [passkeySupported, setPasskeySupported] = useState(false)
  const [usingPasskey, setUsingPasskey] = useState(false)
  const inFlight = useRef(false)
  const ceremony = useRef<AbortController | null>(null)

  useEffect(() => {
    setPasskeySupported(canUsePasskeys())
    return () => ceremony.current?.abort()
  }, [])

  async function signInWithPasskey() {
    if (inFlight.current) return
    inFlight.current = true
    setUsingPasskey(true)
    setError(null)
    const controller = new AbortController()
    ceremony.current = controller
    try {
      const { data, error } = await createClient().auth.signInWithPasskey({ options: { signal: controller.signal } })
      if (error) throw error
      if (!data?.session) throw new Error('Missing session')
      window.location.assign(`/auth/complete?next=${encodeURIComponent(nextPath)}`)
    } catch (error) {
      setError(passkeyErrorMessage(error))
    } finally {
      ceremony.current = null
      inFlight.current = false
      setUsingPasskey(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const callback = new URL('/auth/callback', window.location.origin)
    callback.searchParams.set('next', nextPath)

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: callback.toString(),
          data: name.trim() ? { name: name.trim() } : undefined,
        },
      })
      if (authError) {
        setError(authError.message)
        return
      }
      setSent(true)
    } catch {
      setError('We couldn’t send the sign-in link. Please try again.')
    } finally {
      setSubmitting(false)
      inFlight.current = false
    }
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
      {passkeySupported && (
        <div className="space-y-3 border-b border-black/10 pb-5">
          <button type="button" onClick={signInWithPasskey} disabled={submitting || usingPasskey}
            className="w-full rounded-xl bg-accent px-5 py-3 font-bold text-white transition hover:bg-accent/85 disabled:opacity-60">
            {usingPasskey ? 'Waiting for your passkey…' : 'Sign in with a passkey'}
          </button>
          {usingPasskey && <button type="button" onClick={() => ceremony.current?.abort()} className="text-sm underline">Cancel passkey request</button>}
          <p className="text-sm text-foreground/65">New here, or don’t have your passkey? Sign in by email below. You can add a passkey in My Info.</p>
        </div>
      )}
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
        disabled={submitting || usingPasskey}
        className="w-full rounded-xl bg-accent px-5 py-3 font-bold text-white transition hover:bg-accent/85 disabled:opacity-60"
      >
        {submitting ? 'Sending link…' : 'Email me a sign-in link'}
      </button>
    </form>
  )
}
