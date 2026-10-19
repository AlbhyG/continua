'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { canUsePasskeys, passkeyErrorMessage, isAlreadyRegisteredError } from '@/lib/auth/passkeys'
import { deviceHasPasskey, passkeyOfferSnoozed, rememberPasskeyOnDevice, snoozePasskeyOffer } from '@/lib/auth/device-memory'
import { passkeySetupEligibility } from './actions'

export default function PasskeySetup({ nextPath }: { nextPath: string }) {
  const [offered, setOffered] = useState(false)
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elsewhere, setElsewhere] = useState(false)
  const started = useRef(false)
  const ceremony = useRef<AbortController | null>(null)

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!canUsePasskeys() || deviceHasPasskey() || passkeyOfferSnoozed()) { window.location.replace(nextPath); return }
    passkeySetupEligibility().then(({ eligible, elsewhere }) => {
      if (!eligible) { window.location.replace(nextPath); return }
      setElsewhere(elsewhere)
      setOffered(true)
    }).catch(() => window.location.replace(nextPath))
  }, [nextPath])
  useEffect(() => () => ceremony.current?.abort(), [])

  async function addPasskey() {
    if (ceremony.current) return
    const controller = new AbortController()
    ceremony.current = controller
    setBusy(true)
    setError(null)
    try {
      const { error } = await createClient().auth.registerPasskey({ options: { signal: controller.signal } })
      if (error) throw error
      rememberPasskeyOnDevice()
      setAdded(true)
    } catch (error) {
      // This device already holds a Continua passkey: nothing to add, and
      // next time the sign-in page will lead with the passkey button.
      if (isAlreadyRegisteredError(error)) { rememberPasskeyOnDevice(); setAdded(true); return }
      setError(passkeyErrorMessage(error))
    }
    finally { ceremony.current = null; setBusy(false) }
  }

  return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-6 py-16">
    <section className="glass-card w-full p-7 md:p-9">
      {!offered ? <p role="status">Finishing sign-in…</p> : <>
        <h1 className="text-3xl font-bold">{added ? 'This device is set up' : 'Skip the email next time'}</h1>
        {added ? <p role="status" className="mt-4 text-foreground/80">Next time on this device, tap “Sign in with a passkey” and use Face ID, Touch ID, or your screen lock. Email sign-in still works everywhere.</p> : <>
          <p className="mt-4 text-foreground/80">You’re signed in. Add a passkey for this device and next time you can sign in with Face ID, Touch ID, or your screen lock instead of waiting for an email.</p>
          {elsewhere && <p className="mt-3 text-sm text-foreground/80">You already have a passkey on another device. Passkeys don’t always carry over between devices or browsers, so add one here too.</p>}
          <p className="mt-3 text-sm text-foreground/70">Optional. You can also add one later under Account.</p>
          {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
          <button type="button" disabled={busy} onClick={addPasskey} className="mt-6 w-full rounded-xl bg-foreground px-5 py-3 font-bold text-white hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">{busy ? 'Waiting for your device…' : 'Add a passkey'}</button>
          {busy && <button type="button" onClick={() => ceremony.current?.abort()} className="mt-2 min-h-11 underline underline-offset-4">Cancel passkey request</button>}
        </>}
      </>}
      <a href={nextPath} onClick={() => { ceremony.current?.abort(); if (offered && !added) snoozePasskeyOffer() }} className="mt-4 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{added || !offered ? 'Continue' : 'Not now'}</a>
    </section>
  </main>
}
