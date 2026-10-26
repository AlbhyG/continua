'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// Opened from "Name, photo & settings" (?settings=open): the page renders after
// a loading screen, so the browser's own jump to #settings happens too early.
// Scroll there once the section exists, and open it if it was closed.
export default function SettingsScroll() {
  const params = useSearchParams()
  const wanted = params.get('settings') === 'open'
  useEffect(() => {
    if (!wanted) return
    const el = document.getElementById('settings') as HTMLDetailsElement | null
    if (!el) return
    el.open = true
    el.scrollIntoView({ block: 'start' })
  }, [wanted, params])
  return null
}
