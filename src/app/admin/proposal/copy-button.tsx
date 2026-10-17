'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          setCopied(false)
        }
      }}
      className="h-8 rounded border border-gray-300 bg-white px-2 text-xs font-semibold"
    >
      {copied ? 'Copied' : 'Copy link'}
    </button>
  )
}
