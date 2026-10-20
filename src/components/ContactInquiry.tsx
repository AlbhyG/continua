'use client'

import { useRef, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { contactInquiryAction } from '@/app/actions/contact-inquiry'

export default function ContactInquiry({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)
  const requestId = useRef<string | null>(null)
  function edit() { requestId.current = null }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError(null)
    requestId.current ??= crypto.randomUUID()
    try {
      const result = await contactInquiryAction({ name, email, message, website, requestId: requestId.current })
      if (!result.success) { setError(result.error || 'Please try again.'); return }
      setSent(true)
      setName(''); setEmail(''); setMessage(''); setWebsite(''); requestId.current = null
    } catch {
      setError('We couldn’t send your message. Please try again in a minute.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  return <>
    <button type="button" onClick={() => { setOpen(true); setSent(false); setError(null) }} className={`whitespace-nowrap rounded-full border border-accent/40 font-semibold text-accent hover:bg-accent/5 ${compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'}`}>Contact Me</button>
    <Dialog open={open} onClose={() => { if (!busy) setOpen(false) }} className="relative z-[110]">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-2xl font-bold">Contact Me</DialogTitle>
              <button type="button" disabled={busy} onClick={() => setOpen(false)} aria-label="Close contact form" className="rounded-lg px-3 py-2 text-sm underline disabled:opacity-50">Close</button>
            </div>
            {sent ? <p role="status" className="mt-4">Thank you—your message has been sent. We’ll reply to the email you provided.</p> : <form onSubmit={submit} className="mt-4 space-y-4">
              <p className="text-sm text-foreground/65">Send a question or general inquiry to Albhy. For the book sample, use Get the First Chapter.</p>
              <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
                <label className="block text-sm font-semibold">Name
                  <input name="name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => { setName(event.target.value); edit() }} className="mt-1 block w-full rounded-lg border border-black/20 px-3 py-2" />
                </label>
                <label className="block text-sm font-semibold">Email
                  <input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => { setEmail(event.target.value); edit() }} className="mt-1 block w-full rounded-lg border border-black/20 px-3 py-2" />
                </label>
                <label className="block text-sm font-semibold">Message
                  <textarea name="message" required maxLength={5000} rows={5} value={message} onChange={(event) => { setMessage(event.target.value); edit() }} className="mt-1 block w-full rounded-lg border border-black/20 px-3 py-2" />
                </label>
                <div aria-hidden="true" className="hidden">
                  <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
                </div>
                <p className="text-xs text-foreground/60">We’ll use your details to respond to your message. <a href="/privacy" className="underline">Privacy policy</a></p>
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <button type="submit" className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white hover:bg-accent/85">{busy ? 'Sending…' : 'Send message'}</button>
              </fieldset>
            </form>}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </>
}
