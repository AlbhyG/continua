'use client'

import { useState, useTransition } from 'react'
import { createTestSignInLinkAction } from './actions'

const QUICK_FILLS = ['t1@continua.info', 't2@continua.info', 't3@continua.info']

export default function TestAccountPanel() {
  const [email, setEmail] = useState('')
  const [link, setLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function getLink(targetEmail: string) {
    setError(null)
    setLink(null)
    setCopied(false)
    startTransition(async () => {
      const result = await createTestSignInLinkAction(targetEmail)
      if ('error' in result) {
        setError(result.error)
      } else {
        setLink(result.link)
      }
    })
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900">Test accounts</h2>
      <p className="mt-1 text-sm text-gray-600">
        Generate a one-click sign-in link for a test email — no real inbox
        needed, the account is created automatically if it doesn&apos;t
        exist yet. Open the link in a private/incognito window to sign in as
        that identity without losing your own admin session here.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {QUICK_FILLS.map((quick) => (
          <button
            key={quick}
            type="button"
            onClick={() => setEmail(quick)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {quick}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (email.trim()) getLink(email)
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="t1@continua.info"
          className="h-9 w-64 rounded border border-gray-300 px-3 text-sm"
        />
        <button
          type="submit"
          disabled={isPending || !email.trim()}
          className="h-9 rounded bg-gray-900 px-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50"
        >
          {isPending ? 'Generating…' : 'Get sign-in link'}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {link && (
        <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3">
          <p className="break-all text-xs text-gray-700">{link}</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(link)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-accent underline underline-offset-2"
            >
              Open in new tab
            </a>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This link signs in as {email.trim().toLowerCase()} the moment
            it&apos;s opened — use a private window if you want to keep
            your own session signed in elsewhere.
          </p>
        </div>
      )}
    </div>
  )
}
