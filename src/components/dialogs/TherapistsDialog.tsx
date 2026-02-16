'use client'

import { useState, useEffect, useActionState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { requestVerificationAction, type RequestVerificationState } from '@/app/actions/request-verification'
import { signupSchema } from '@/lib/validations/signup'

interface TherapistsDialogProps {
  isOpen: boolean
  onClose: () => void
}

function SubmitButton({ isValid, isPending }: { isValid: boolean; isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={!isValid || isPending}
      className="w-full rounded-full bg-accent text-white font-bold py-2 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Sending...' : 'Request Book'}
    </button>
  )
}

export default function TherapistsDialog({ isOpen, onClose }: TherapistsDialogProps) {
  const [state, formAction, isPending] = useActionState<RequestVerificationState, FormData>(requestVerificationAction, null)
  const [values, setValues] = useState({ name: '', email: '' })
  const [touched, setTouched] = useState({ name: false, email: false })
  const [clientErrors, setClientErrors] = useState({ name: '', email: '' })

  // Reset form state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setValues({ name: '', email: '' })
      setTouched({ name: false, email: false })
      setClientErrors({ name: '', email: '' })
    }
  }, [isOpen])

  const validate = (field: 'name' | 'email', value: string) => {
    const result = signupSchema.shape[field].safeParse(value)
    if (!result.success) {
      setClientErrors((prev) => ({ ...prev, [field]: result.error.issues[0]?.message || '' }))
    } else {
      setClientErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: 'name' | 'email', value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validate(field, value)
  }

  const handleChange = (field: 'name' | 'email', value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      validate(field, value)
    }
  }

  const isValid = touched.name && touched.email && !clientErrors.name && !clientErrors.email

  // Show confirmation view if successful
  if (state?.success) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
        <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" />

        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <DialogPanel className="max-w-md w-full rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
            <DialogTitle className="text-lg font-bold text-foreground">
              Check your email
            </DialogTitle>

            <p className="text-sm text-gray-600 mt-2">
              We've sent a verification link to your email address. Click the link to verify your email and access your Book download.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    )
  }

  // Show form view
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <DialogPanel className="max-w-md w-full rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
          <DialogTitle className="text-lg font-bold text-foreground">
            Therapists Book
          </DialogTitle>

          <Description className="text-sm text-gray-600 mt-2">
            Enter your information to receive the Therapists Book. We'll send you a verification email to confirm your email address.
          </Description>

          <form action={formAction} className="mt-4 space-y-4">
            <input type="hidden" name="book_type" value="therapists" />

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onBlur={(e) => handleBlur('name', e.target.value)}
                onChange={(e) => handleChange('name', e.target.value)}
                aria-invalid={touched.name && !!clientErrors.name}
                aria-describedby={touched.name && clientErrors.name ? 'name-error' : undefined}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {touched.name && clientErrors.name && (
                <div
                  id="name-error"
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-red-600 mt-1"
                >
                  {clientErrors.name}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onBlur={(e) => handleBlur('email', e.target.value)}
                onChange={(e) => handleChange('email', e.target.value)}
                aria-invalid={touched.email && !!clientErrors.email}
                aria-describedby={touched.email && clientErrors.email ? 'email-error' : undefined}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {touched.email && clientErrors.email && (
                <div
                  id="email-error"
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-red-600 mt-1"
                >
                  {clientErrors.email}
                </div>
              )}
            </div>

            {state?.errors?.form && (
              <div
                role="alert"
                aria-live="polite"
                className="text-sm text-red-600"
              >
                {state.errors.form[0]}
              </div>
            )}

            <SubmitButton isValid={isValid} isPending={isPending} />
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
