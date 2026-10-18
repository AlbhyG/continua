'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// Cloudflare Turnstile bot check. Supabase's CAPTCHA protection (Auth →
// Attack Protection) refuses sign-in/sign-up email requests without a fresh
// token, which also stops bots that call Supabase directly with the public
// key. Usually invisible: it only shows a checkbox when Cloudflare is unsure.
//
// Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, so the site
// works unchanged until the keys are configured.

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.turnstile) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_SRC
      s.async = true
      s.defer = true
      s.onload = () => resolve()
      s.onerror = () => { scriptPromise = null; reject(new Error('Turnstile failed to load')) }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

export type TurnstileHandle = { reset: () => void }

const Turnstile = forwardRef<TurnstileHandle, { onToken: (token: string | null) => void }>(
  function Turnstile({ onToken }, ref) {
    const box = useRef<HTMLDivElement>(null)
    const widget = useRef<string | null>(null)
    const onTokenRef = useRef(onToken)
    onTokenRef.current = onToken

    useImperativeHandle(ref, () => ({
      reset: () => {
        onTokenRef.current(null)
        if (widget.current && window.turnstile) window.turnstile.reset(widget.current)
      },
    }))

    useEffect(() => {
      if (!TURNSTILE_SITE_KEY) return
      let cancelled = false
      loadScript()
        .then(() => {
          if (cancelled || !box.current || !window.turnstile) return
          widget.current = window.turnstile.render(box.current, {
            sitekey: TURNSTILE_SITE_KEY,
            appearance: 'interaction-only',
            size: 'flexible',
            callback: (token: string) => onTokenRef.current(token),
            'expired-callback': () => onTokenRef.current(null),
            'error-callback': () => onTokenRef.current(null),
          })
        })
        .catch(() => onTokenRef.current(null))
      return () => {
        cancelled = true
        if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
        widget.current = null
      }
    }, [])

    if (!TURNSTILE_SITE_KEY) return null
    return <div ref={box} className="min-h-0" />
  }
)

export default Turnstile
