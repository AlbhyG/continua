'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { canUsePasskeys, passkeyErrorMessage } from '@/lib/auth/passkeys'
import { consumePasskeySetupOffer } from './actions'

export default function PasskeySetup({ nextPath }: { nextPath: string }) {
  const [offered, setOffered] = useState(false)
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)
  const ceremony = useRef<AbortController | null>(null)

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!canUsePasskeys()) { window.location.replace(nextPath); return }
    consumePasskeySetupOffer().then((show) => {
      if (show) setOffered(true)
      else window.location.replace(nextPath)
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
      setAdded(true)
    } catch (error) { setError(passkeyErrorMessage(error)) }
    finally { ceremony.current = null; setBusy(false) }
  }

  return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-6 py-16">
    <section className="glass-card w-full p-7 md:p-9">
      {!offered ? <p role="status">Finishing sign-in…</p> : <>
        <h1 className="text-3xl font-bold">{added ? 'Your passkey is ready' : 'Make this faster next time'}</h1>
        {added ? <p role="status" className="mt-4 text-foreground/80">Passkey added to this account. Your assessments stay in the same place, and email sign-in still works.</p> : <>
          <p className="mt-4 text-foreground/80">You’re signed in. Add a passkey with Face ID, Touch ID, your device’s screen lock, or a security key.</p>
          <p className="text-sm text-foreground/80">This is optional. You can keep using email, and add or manage passkeys later in My Info.</p>
          {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
          <button type="button" disabled={busy} onClick={addPasskey} className="mt-6 w-full rounded-xl bg-foreground px-5 py-3 font-bold text-white hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">{busy ? 'Waiting for your device…' : 'Add a passkey'}</button>
          {busy && <button type="button" onClick={() => ceremony.current?.abort()} className="mt-2 min-h-11 underline underline-offset-4">Cancel passkey request</button>}
        </>}
      </>}
      <a href={nextPath} onClick={() => ceremony.current?.abort()} className="mt-4 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{added || !offered ? 'Continue' : 'Skip for now'}</a>
    </section>
  </main>
}
