'use client'

import { useEffect, useRef, useState } from 'react'
import type { PasskeyListItem } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { canUsePasskeys, passkeyErrorMessage } from '@/lib/auth/passkeys'

export default function PasskeySettings() {
  const [passkeys, setPasskeys] = useState<PasskeyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [supported, setSupported] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState('')
  const inFlight = useRef(false)
  const ceremony = useRef<AbortController | null>(null)

  async function refresh() {
    const { data, error } = await createClient().auth.passkey.list()
    if (error) throw error
    setPasskeys(data ?? [])
  }

  useEffect(() => {
    setSupported(canUsePasskeys())
    refresh().catch((error) => setError(passkeyErrorMessage(error))).finally(() => setLoading(false))
    return () => ceremony.current?.abort()
  }, [])

  async function run(action: () => Promise<void>, success: string) {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await action()
      setMessage(success)
      await refresh()
    } catch (error) {
      setError(passkeyErrorMessage(error))
    } finally {
      inFlight.current = false
      ceremony.current = null
      setBusy(false)
    }
  }

  return (
    <section className="glass-card mt-8 p-5 md:p-6" aria-labelledby="passkeys-title">
      <h2 id="passkeys-title" className="text-xl font-bold">Passkeys</h2>
      <p className="mt-2 text-sm text-foreground/70">Sign in with your fingerprint, face, device PIN, or security key. Email sign-in remains available if you lose access to your passkeys.</p>
      {!supported && <p className="mt-3 text-sm text-foreground/70">To add a passkey, open continua.info in a browser that supports passkeys.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-foreground/80">{message}</p>}
      {loading ? <p className="mt-4 text-sm">Loading passkeys…</p> : (
        <>
          {passkeys.length === 0 && !error && <p className="mt-4 text-sm text-foreground/65">No passkeys added yet.</p>}
          <ul className="mt-4 space-y-3">
            {passkeys.map((passkey) => (
              <li key={passkey.id} className="rounded-xl bg-white/50 p-4">
                {editing === passkey.id ? (
                  <form onSubmit={(event) => {
                    event.preventDefault()
                    if (!name.trim()) return
                    void run(async () => {
                      const { error } = await createClient().auth.passkey.update({ passkeyId: passkey.id, friendlyName: name.trim() })
                      if (error) throw error
                      setEditing(null)
                    }, 'Passkey renamed.')
                  }} className="flex flex-wrap items-end gap-3">
                    <label className="text-sm font-semibold">Passkey name
                      <input autoFocus required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 block w-full rounded-lg border border-black/20 bg-white p-2" />
                    </label>
                    <button disabled={busy || !name.trim()} className="text-sm font-semibold underline disabled:opacity-50">Save name</button>
                    <button type="button" disabled={busy} onClick={() => setEditing(null)} className="text-sm underline">Cancel</button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{passkey.friendly_name || 'Passkey'}</p>
                      <p className="mt-1 text-xs text-foreground/60">Added {new Date(passkey.created_at).toLocaleDateString()}{passkey.last_used_at ? ` · Last used ${new Date(passkey.last_used_at).toLocaleDateString()}` : ''}</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <button disabled={busy} onClick={() => { setEditing(passkey.id); setName(passkey.friendly_name || 'Passkey'); setRemoving(null) }} className="font-semibold underline disabled:opacity-50">Rename</button>
                      <button disabled={busy} onClick={() => { setRemoving(passkey.id); setEditing(null) }} className="text-red-700 underline disabled:opacity-50">Remove</button>
                    </div>
                  </div>
                )}
                {removing === passkey.id && (
                  <div className="mt-3 border-t border-black/10 pt-3">
                    <p className="text-sm">Remove this passkey from Continua? {passkeys.length === 1 ? 'This is your last passkey; you can still sign in by email.' : 'Your other passkeys will keep working.'} This does not remove it from your device’s password manager.</p>
                    <div className="mt-3 flex gap-4 text-sm">
                      <button disabled={busy} onClick={() => void run(async () => {
                        const { error } = await createClient().auth.passkey.delete({ passkeyId: passkey.id })
                        if (error) throw error
                        setRemoving(null)
                      }, 'Passkey removed. Email sign-in is still available.')} className="font-semibold text-red-700 underline disabled:opacity-50">Confirm removal</button>
                      <button disabled={busy} onClick={() => setRemoving(null)} className="underline">Keep passkey</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      <button disabled={busy || loading || !supported} onClick={() => void run(async () => {
        const controller = new AbortController()
        ceremony.current = controller
        const { error } = await createClient().auth.registerPasskey({ options: { signal: controller.signal } })
        if (error) throw error
      }, 'Passkey added. You can use it the next time you sign in.')} className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent/85 disabled:opacity-50">
        {busy ? 'Working…' : 'Add a passkey'}
      </button>
      {busy && ceremony.current && <button onClick={() => ceremony.current?.abort()} className="ml-4 text-sm underline">Cancel passkey request</button>}
    </section>
  )
}
