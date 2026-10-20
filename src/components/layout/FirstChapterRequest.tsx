'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
  Portal,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { getStartedAction } from '@/app/actions/get-started'
import { createClient } from '@/lib/supabase/client'

// The "Get the First Chapter" button, its request form, and the confirmation
// dialog. The header shows the button twice (desktop and phone); both share
// one form state so what someone typed survives switching layouts.

export type ContactFormState = {
  values: { name: string; email: string; phone: string }
  confirmed: boolean
}

export const emptyContactForm: ContactFormState = {
  values: { name: '', email: '', phone: '' },
  confirmed: false,
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors'

function ContactForm({
  state,
  setState,
  onSuccess,
}: {
  state: ContactFormState
  setState: React.Dispatch<React.SetStateAction<ContactFormState>>
  onSuccess: (message: string) => void
}) {
  const { values, confirmed } = state
  const submitInFlight = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasContact = values.email.trim() !== '' || values.phone.trim() !== ''
  const canSubmit = values.name.trim() !== '' && hasContact && confirmed

  const setField = (field: keyof ContactFormState['values'], value: string) => {
    setError(null)
    setState((s) => ({ ...s, values: { ...s.values, [field]: value } }))
  }

  const handleSubmit = async () => {
    if (submitInFlight.current || !canSubmit) {
      return
    }
    submitInFlight.current = true
    setError(null)
    setSubmitting(true)
    try {
      const result = await getStartedAction({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
      })
      if (!result.success) {
        setError(result.error || 'Something went wrong. Please try again.')
        return
      }
      setState(emptyContactForm)
      onSuccess(
        result.deliveryMethod === 'manual'
          ? result.smsSent
            ? 'Thanks. Your information was saved, and a text with the first chapter is on its way.'
            : 'Thanks. Your information was saved, and Albhy will follow up manually.'
          : result.smsSent
            ? 'Thanks. The first chapter is on its way by email and text.'
            : 'Thanks. The first chapter is on its way by email.'
      )
    } finally {
      submitInFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="p-5 space-y-3">
      <div>
        <p className="text-base font-bold text-foreground">
          Interested in reading the first chapter?
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Tell us where to send your copy.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          className={inputClass}
        />
      </div>
      <p className="text-xs text-gray-400 text-center">And / Or</p>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => setField('phone', e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter a phone number only if you want low-volume text follow-up about your Continua request.
        </p>
      </div>
      <label className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => {
            setError(null)
            setState((s) => ({ ...s, confirmed: e.target.checked }))
          }}
          className="mt-0.5 rounded border-gray-300"
        />
        <span>
          OK for Continua to contact me about this request. If I provide a phone number, I agree to receive service-related texts from Continua. Message/data rates may apply, frequency varies, reply STOP to opt out or HELP for help.
        </span>
      </label>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !canSubmit}
        className="w-full mt-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {submitting ? 'Sending...' : 'Send me the first chapter'}
      </button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// The signed-in account's verified email, or null when signed out / unknown.
export function useSignedInEmail() {
  const [email, setEmail] = useState<string | null>(null)
  useEffect(() => {
    const supabase = createClient()
    const read = (user: { email?: string; email_confirmed_at?: string | null } | null | undefined) =>
      setEmail(user?.email && user.email_confirmed_at ? user.email.toLowerCase() : null)
    supabase.auth.getUser().then(({ data }) => read(data.user))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => read(session?.user))
    return () => subscription.unsubscribe()
  }, [])
  return email
}

// Signed-in readers get the sample in one click; the form stays available
// for sending a copy somewhere else.
function SampleRequestPanel({
  signedInEmail,
  state,
  setState,
  onSuccess,
  close,
}: {
  signedInEmail: string | null
  state: ContactFormState
  setState: React.Dispatch<React.SetStateAction<ContactFormState>>
  onSuccess: (message: string) => void
  close: () => void
}) {
  const [useForm, setUseForm] = useState(false)
  if (!signedInEmail || useForm) {
    return <ContactForm state={state} setState={setState} onSuccess={onSuccess} />
  }
  return (
    <div className="p-5 space-y-3">
      <p className="text-base font-bold text-foreground">Read the first chapter</p>
      <a
        href="/sample"
        target="_blank"
        rel="noopener"
        onClick={() => close()}
        className="block w-full px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold text-center hover:bg-accent/90 transition-colors"
      >
        Download the PDF
      </a>
      <button
        type="button"
        onClick={() => setUseForm(true)}
        className="text-xs font-semibold text-foreground/70 underline underline-offset-2 hover:text-foreground cursor-pointer"
      >
        Send it to a different email or phone instead
      </button>
    </div>
  )
}

// The button and its pop-up panel. `buttonClassName` sets the desktop or phone look.
export function FirstChapterPopover({
  buttonClassName,
  portalReady,
  signedInEmail,
  state,
  setState,
  onSuccess,
}: {
  buttonClassName: string
  portalReady: boolean
  signedInEmail: string | null
  state: ContactFormState
  setState: React.Dispatch<React.SetStateAction<ContactFormState>>
  onSuccess: (message: string) => void
}) {
  return (
    <Popover className="relative">
      <PopoverButton className={buttonClassName}>Get the First Chapter</PopoverButton>
      {portalReady && (
        <Portal>
          <PopoverBackdrop className="fixed inset-0 z-[90] bg-transparent" />
        </Portal>
      )}
      <PopoverPanel
        anchor="bottom end"
        className="z-[100] mt-2 w-[280px] rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-2 ring-black/10"
      >
        {({ close }) => (
          <SampleRequestPanel
            signedInEmail={signedInEmail}
            state={state}
            setState={setState}
            close={close}
            onSuccess={(message) => {
              close()
              onSuccess(message)
            }}
          />
        )}
      </PopoverPanel>
    </Popover>
  )
}

export function ContactSuccessDialog({
  message,
  onClose,
}: {
  message: string | null
  onClose: () => void
}) {
  return (
    <Dialog open={message !== null} onClose={onClose} className="relative z-[70]">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70]" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
          <DialogTitle className="text-lg font-bold text-foreground">
            Your doc is on the way
          </DialogTitle>
          <p className="mt-3 text-sm leading-6 text-foreground/75" role="status">
            {message}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors cursor-pointer"
          >
            OK
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
