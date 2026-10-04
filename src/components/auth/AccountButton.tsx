'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AccountButton({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user))
    })
    return () => subscription.unsubscribe()
  }, [])

  const linkClassName = mobile
    ? 'block w-full rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white'
    : 'whitespace-nowrap text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground'

  if (signedIn === null) {
    return <span className={linkClassName}>Account</span>
  }

  if (!signedIn) {
    return (
      <Link href={/^\/(login|auth)(\/|$)/.test(pathname) ? '/login' : `/login?next=${encodeURIComponent(pathname)}`}
        onClick={(event) => {
          if (!/^\/(login|auth)(\/|$)/.test(window.location.pathname)) {
            event.currentTarget.href = '/login?next=' + encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)
          }
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
            event.preventDefault()
            router.push(event.currentTarget.getAttribute('href')!)
          }
          onNavigate?.()
        }} className={linkClassName}>
        Sign in
      </Link>
    )
  }

  return (
    <div className={mobile ? 'grid w-full grid-cols-2 gap-2' : 'flex items-center gap-3'}>
      <Link href="/my-info" onClick={onNavigate} className={linkClassName}>
        Account
      </Link>
      <form action="/auth/signout" method="post" className={mobile ? 'w-full' : undefined}>
        <button
          type="submit"
          className={
            mobile
              ? 'w-full rounded-xl border border-accent/25 bg-white px-4 py-2.5 text-center text-sm font-semibold text-accent'
              : 'whitespace-nowrap text-sm font-semibold text-foreground/55 transition-colors hover:text-foreground'
          }
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
