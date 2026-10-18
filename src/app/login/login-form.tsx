'use client'

import { useEffect, useRef, useState } from 'react'
import type { AuthPasskeyAuthenticationVerifyResponse } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { canUsePasskeys, passkeySignInErrorMessage } from '@/lib/auth/passkeys'
import { deviceHasPasskey, forgetPasskeyOnDevice, rememberPasskeyOnDevice } from '@/lib/auth/device-memory'
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
  // Lead with the passkey only on a browser known to have one; elsewhere,
  // email is what will actually work, so it goes first.
  const [passkeyHere, setPasskeyHere] = useState(false)
  // Code entry: shown after a link is sent, or on request after a link failed
  // (some email apps, e.g. Outlook's servers, open links before the person does).
  const [code, setCode] = useState('')
  const [codeMode, setCodeMode] = useState(false)
  const [verifying, setVerifying] = useState(false)
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
    rememberPasskeyOnDevice()
    navigating.current = true
    window.location.assign('/auth/complete?next=' + encodeURIComponent(nextPath))
  }

  useEffect(() => {
    setSupported(canUsePasskeys())
    setPasskeyHere(deviceHasPasskey())
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
      if ((error as { code?: string } | null)?.code === 'webauthn_credential_not_found') {
        forgetPasskeyOnDevice()
        setPasskeyHere(false)
      }
      setError(passkeySignInErrorMessage(error))
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

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || navigating.current) return
    const token = code.replace(/\s/g, '')
    const address = email.trim().toLowerCase()
    if (!address) { setError('Enter the email the code was sent to.'); return }
    if (!/^\d{6,10}$/.test(token)) { setError('Enter the 8-digit code from the email.'); return }
    inFlight.current = true
    setVerifying(true)
    setError(null)
    try {
      autofill.current?.controller.abort()
      const { error } = await createClient().auth.verifyOtp({ email: address, token, type: 'email' })
      if (error) throw error
      navigating.current = true
      window.location.assign('/auth/passkey-setup?next=' + encodeURIComponent(nextPath))
    } catch {
      setError('That code didn’t work. Codes expire after an hour, and requesting a new email replaces the old code, so use the code from your newest email.')
    } finally {
      inFlight.current = false
      setVerifying(false)
    }
  }

  const codeFields = (
    <>
      <label htmlFor="login-code" className="mb-2 block font-semibold">Code from the email</label>
      <input id="login-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={12}
        value={code} onChange={(event) => setCode(event.target.value)} disabled={verifying}
        placeholder="12345678"
        className="w-full rounded-xl border border-black/20 bg-white/85 px-4 py-3 text-lg tracking-[0.3em] caret-foreground outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 disabled:opacity-60" />
      {error && <p className="mt-3 text-sm text-red-800" role="alert">{error}</p>}
      <button type="submit" disabled={verifying}
        className="mt-4 w-full rounded-xl bg-foreground px-5 py-3 font-bold text-white hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">
        {verifying ? 'Checking…' : 'Sign in with code'}
      </button>
    </>
  )

  // A link failed or the person chose to type a code: email + code together.
  if (codeMode) return (
    <form onSubmit={verifyCode} className="mt-6 space-y-4">
      <p className="text-foreground/80">Enter your email and the 8-digit code from your newest Continua sign-in email.</p>
      <div>
        <label htmlFor="code-email" className="mb-2 block font-semibold">Email</label>
        <input id="code-email" type="email" autoComplete="username" required maxLength={254}
          value={email} onChange={(event) => setEmail(event.target.value)} disabled={verifying}
          className="w-full rounded-xl border border-black/20 bg-white/85 px-4 py-3 caret-foreground outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 disabled:opacity-60" />
      </div>
      <div>{codeFields}</div>
      <button type="button" onClick={() => { setCodeMode(false); setError(null) }} className="min-h-11 font-semibold underline underline-offset-4">Email me a new link instead</button>
    </form>
  )

  if (sent) return (
    <div className="mt-6">
      <h2 role="status" className="text-xl font-bold">Check your email</h2>
      <p className="mt-2 text-foreground/80">We sent a sign-in link and a 8-digit code to <strong className="break-all">{email.trim()}</strong>. It may take a minute to arrive.</p>
      <p className="mt-2 text-foreground/80">Tap the link in the email, or type the code here. The code works even if your email app opens links on its own, or if you’re reading email on another device.</p>
      <form onSubmit={verifyCode} className="mt-5">{codeFields}</form>
      <button type="button" onClick={() => { setSent(false); setCode(''); setError(null) }} className="mt-4 min-h-11 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Use a different email</button>
    </div>
  )

  const passkeyButton = (primary: boolean) => (
    <>
      <button type="button" onClick={signInWithPasskey} disabled={submitting || usingPasskey}
        className={primary
          ? 'w-full rounded-xl bg-foreground px-5 py-3 font-bold text-white hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60'
          : 'w-full rounded-xl border border-foreground/40 bg-white/60 px-5 py-3 font-bold text-foreground hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60'}>
        {usingPasskey ? 'Waiting for your passkey…' : 'Sign in with a passkey'}
      </button>
      {usingPasskey && <button type="button" onClick={() => ceremony.current?.abort()} className="mt-2 block min-h-11 underline underline-offset-4">Cancel passkey request</button>}
    </>
  )

  const emailFields = (primary: boolean) => (
    <>
      <div>
        <label htmlFor="login-email" className="mb-2 block font-semibold">Email</label>
        <input ref={emailInput} id="login-email" type="email" autoComplete="username webauthn" required maxLength={254}
          value={email} onChange={(event) => setEmail(event.target.value)} disabled={submitting || usingPasskey}
          aria-describedby="login-help" aria-invalid={error ? true : undefined}
          className="w-full rounded-xl border border-black/20 bg-white/85 px-4 py-3 caret-foreground outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 disabled:opacity-60" />
        <p id="login-help" className="mt-2 text-sm text-foreground/80">We’ll email you a secure sign-in link. New here, or on a new device? Start with email; you can add a passkey for this device right after.</p>
      </div>
      {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
      {initialError && error === initialError && (
        <button type="button" onClick={() => { setCodeMode(true); setError(null) }}
          className="w-full rounded-xl border border-foreground/40 bg-white/60 px-5 py-3 font-bold text-foreground hover:bg-white/90">
          Enter the code from that email
        </button>
      )}
      <button type="submit" disabled={submitting || usingPasskey}
        className={primary
          ? 'w-full rounded-xl bg-foreground px-5 py-3 font-bold text-white hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60'
          : 'w-full rounded-xl border border-foreground/40 bg-white/60 px-5 py-3 font-bold text-foreground hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60'}>
        {submitting ? 'Sending link…' : 'Email me a sign-in link'}
      </button>
    </>
  )

  // This browser has signed in with a passkey before: passkey first.
  if (supported && passkeyHere) return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="border-b border-black/10 pb-5">
        {passkeyButton(true)}
        <p className="mt-2 text-sm text-foreground/80">Use the passkey saved on this device.</p>
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider text-foreground/60">Or use your email</p>
      {emailFields(false)}
    </form>
  )

  // New device, or passkeys not used here yet: email first.
  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {emailFields(true)}
      {supported && <div className="border-t border-black/10 pt-5">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground/60">Already added a passkey on this device?</p>
        {passkeyButton(false)}
      </div>}
    </form>
  )
}
