'use client'

import { useEffect, useRef, useState } from 'react'
import type { AuthPasskeyAuthenticationVerifyResponse } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { canUsePasskeys, passkeyErrorMessage } from '@/lib/auth/passkeys'
import { signInWithPasskeyAutofill, abortable } from '@/lib/auth/passkey-autofill'
import { requestEmailLink } from '@/lib/auth/email-link'

export default function LoginForm({ nextPath, initialError }: { nextPath: string; initialError: string | null }) {
  const [email, setEmail] = useState('')
  const emailInput = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [supported, setSupported] = useState(false)
  const [usingPasskey, setUsingPasskey] = useState(false)
  const inFlight = useRef(false)
  const navigating = useRef(false)
  const ceremony = useRef<AbortController | null>(null)
  const autofill = useRef<{ controller: AbortController; done: Promise<void> } | null>(null)

  async function completePasskey(result: AuthPasskeyAuthenticationVerifyResponse) {
    if (result.error) throw result.error
    if (!result.data?.session || !result.data.user?.email_confirmed_at) throw new Error('Missing verified session')
    const enteredEmail = emailInput.current?.value.trim().toLowerCase()
    if (enteredEmail && enteredEmail !== result.data.user.email?.toLowerCase()) {
      const { error } = await createClient().auth.signOut({ scope: 'local' })
      if (error) throw error
      setError('That passkey belongs to a different email. Use the email link below, or enter the email for your saved passkey.')
      return
    }
    navigating.current = true
    window.location.assign('/auth/complete?next=' + encodeURIComponent(nextPath))
  }

  useEffect(() => {
    setSupported(canUsePasskeys())
    if (!canUsePasskeys()) return
    const controller = new AbortController()
    const done = (async () => {
      try {
        if (!await abortable(Promise.resolve(PublicKeyCredential.isConditionalMediationAvailable?.()), controller.signal) || controller.signal.aborted) return
        const result = await signInWithPasskeyAutofill(createClient(), controller.signal)
        controller.signal.throwIfAborted()
        // Once verification starts, await it before starting another auth path.
        await completePasskey(result)
      } catch {
        // Conditional autofill is silent when no credential/provider is available.
        // Explicit sign-in below provides the visible recovery path.
      }
    })()
    autofill.current = { controller, done }
    return () => { controller.abort(); ceremony.current?.abort() }
    // nextPath is fixed for this mounted form; email is read from the input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPath])

  async function stopAutofill() {
    autofill.current?.controller.abort()
    await autofill.current?.done
  }

  async function signInWithPasskey() {
    if (inFlight.current || navigating.current) return
    inFlight.current = true
    setUsingPasskey(true)
    setError(null)
    const controller = new AbortController()
    ceremony.current = controller
    try {
      await stopAutofill()
      if (navigating.current) return
      controller.signal.throwIfAborted()
      await completePasskey(await createClient().auth.signInWithPasskey({ options: { signal: controller.signal } }))
    } catch (error) {
      setError(passkeyErrorMessage(error))
      emailInput.current?.focus()
    } finally {
      ceremony.current = null
      inFlight.current = false
      setUsingPasskey(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || navigating.current) return
    inFlight.current = true
    setSubmitting(true)
    setError(null)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15_000)
    try {
      // Some Safari credential providers do not promptly settle after abort.
      // Email never waits on that background browser request or its storage.
      autofill.current?.controller.abort()
      if (navigating.current) return
      const callback = new URL('/auth/callback', window.location.origin)
      callback.searchParams.set('next', nextPath)
      await requestEmailLink(email.trim().toLowerCase(), callback.toString(), controller.signal)
      setSent(true)
    } catch (error) {
      setError(controller.signal.aborted
        ? 'Sending the link took too long. Please try again. If a link arrives, you can still use it.'
        : error instanceof Error ? error.message : 'We couldn’t send the sign-in link. Please try again.')
    } finally {
      window.clearTimeout(timeout)
      setSubmitting(false)
      inFlight.current = false
    }
  }

  if (sent) return (
    <div className="mt-6" role="status">
      <h2 className="text-xl font-bold">Check your email</h2>
      <p className="mt-2 text-foreground/80">We sent a sign-in link to <strong className="break-all">{email.trim()}</strong>. It may take a minute to arrive. Open it on the device where you want to sign in.</p>
      <button type="button" onClick={() => setSent(false)} className="mt-4 min-h-11 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Use a different email</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-2 block font-semibold">Email</label>
        <input ref={emailInput} id="login-email" type="email" autoComplete="username webauthn" required maxLength={254}
          value={email} onChange={(event) => setEmail(event.target.value)} disabled={submitting || usingPasskey}
          aria-describedby="login-help" aria-invalid={error ? true : undefined}
          className="w-full rounded-xl border border-black/20 bg-white/85 px-4 py-3 caret-foreground outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 disabled:opacity-60" />
        <p id="login-help" className="mt-2 text-sm text-foreground/80">Choose a saved passkey if your browser offers one, or get a secure link by email.</p>
      </div>
      {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
      <button type="submit" disabled={submitting || usingPasskey}
        className="w-full rounded-xl bg-foreground px-5 py-3 font-bold text-white hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">
        {submitting ? 'Sending link…' : 'Email me a sign-in link'}
      </button>
      {supported && <div className="border-t border-black/10 pt-4">
        <button type="button" onClick={signInWithPasskey} disabled={submitting || usingPasskey}
          className="min-h-11 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">
          {usingPasskey ? 'Waiting for your passkey…' : 'Sign in with a passkey'}
        </button>
        {usingPasskey && <button type="button" onClick={() => ceremony.current?.abort()} className="block min-h-11 underline underline-offset-4">Cancel passkey request</button>}
        <p className="mt-1 text-sm text-foreground/80">Use a Continua passkey saved on this device, or choose another device in the system prompt. New here? Start with email; you can add a passkey after signing in.</p>
      </div>}
    </form>
  )
}
