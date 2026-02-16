'use client'

import { useActionState } from 'react'
import { verifyEmailAction } from '@/app/actions/verify-email'

interface VerificationFormProps {
  token: string
}

export default function VerificationForm({ token }: VerificationFormProps) {
  const [state, formAction, isPending] = useActionState(verifyEmailAction, null)

  // Success state
  if (state?.success) {
    // Check if we have download info
    const hasDownloadInfo = !!(state.email && state.bookType)

    return (
      <div className="max-w-md w-full rounded-2xl bg-white/95 backdrop-blur shadow-lg p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h1>
          {hasDownloadInfo && state.email && state.bookType ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Your email has been verified successfully. Click the button below to download your Book.
              </p>
              <a
                href={`/api/download/${state.bookType}?email=${encodeURIComponent(state.email)}`}
                download
                className="inline-block rounded-full bg-accent text-white font-bold py-3 px-8 hover:bg-accent/90 transition-colors"
              >
                Download {state.bookType.charAt(0).toUpperCase() + state.bookType.slice(1)} Book PDF
              </a>
            </div>
          ) : (
            <p className="text-gray-600">
              Your email has been verified successfully. You'll be able to download your Book shortly.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Default/error state with form
  return (
    <div className="max-w-md w-full rounded-2xl bg-white/95 backdrop-blur shadow-lg p-8">
      <h1 className="text-2xl font-bold text-foreground mb-4">Confirm Your Email</h1>
      <p className="text-gray-600 mb-6">
        Click the button below to verify your email address and access your Book download.
      </p>

      {state?.error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-accent text-white font-bold py-3 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  )
}
