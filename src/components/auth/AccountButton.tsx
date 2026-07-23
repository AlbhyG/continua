'use client'

import Link from 'next/link'
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

  const href = signedIn ? '/my-info' : '/login'
  const label = signedIn ? 'Account' : 'Sign in'
  const className = mobile
    ? 'block w-full rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white'
    : 'whitespace-nowrap text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground'

  return (
    <Link href={href} onClick={onNavigate} className={className}>
      {signedIn === null ? 'Account' : label}
    </Link>
  )
}
