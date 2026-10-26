'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { createClient } from '@/lib/supabase/client'
import { SHOW_PEOPLE_COMPARISON } from '@/lib/site-mode'

const dropdownClass =
  'z-[100] mt-2 min-w-[220px] rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-1 ring-black/5 p-2'
const menuItemClass =
  'block w-full text-left px-4 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-accent/5 hover:text-foreground transition-colors'

// The display name from the account's own "self" person, if set.
async function loadName(userId: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('people')
    .select('name')
    .eq('owner_user_id', userId)
    .eq('is_self', true)
    .maybeSingle()
  return typeof data?.name === 'string' ? data.name.trim() : ''
}

export default function AccountButton({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [who, setWho] = useState<{ name: string; email: string } | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user))
    })
    return () => subscription.unsubscribe()
  }, [])

  // The header stays mounted across pages, so check again with the server on
  // every page change and when the tab regains focus. Otherwise a session that
  // ended in the meantime still shows "Sign out" while the site treats the
  // person as signed out (and saves their assessment without the account).
  useEffect(() => {
    const supabase = createClient()
    let cancelled = false
    const check = () =>
      supabase.auth.getUser().then(async ({ data }) => {
        if (cancelled) return
        setSignedIn(Boolean(data.user))
        if (!data.user) {
          setWho(null)
          return
        }
        const email = data.user.email ?? ''
        const name = await loadName(data.user.id).catch(() => '')
        if (!cancelled) setWho({ name, email })
      })
    check()
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [pathname])

  const linkClassName = mobile
    ? 'block w-full rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white'
    : 'whitespace-nowrap text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground'

  if (signedIn === null) {
    return <span className={linkClassName}>My Continua</span>
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

  if (!mobile) {
    const label = who?.name || who?.email || ''
    const initial = (label.trim()[0] ?? '').toUpperCase()
    return (
      <Menu>
        <MenuButton
          aria-label={label ? `Account: ${label}` : 'Account'}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-accent text-sm font-bold text-white ring-2 ring-white/70 transition hover:bg-accent/85"
        >
          {initial || (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.5-8 5.5V21h16v-1.5c0-3-3.6-5.5-8-5.5Z" />
            </svg>
          )}
        </MenuButton>
        <MenuItems anchor="bottom end" className={dropdownClass}>
          {who && (
            <div className="border-b border-black/5 px-4 pb-2.5 pt-1.5">
              {who.name && <p className="text-sm font-bold text-foreground">{who.name}</p>}
              <p className="text-xs text-foreground/60">{who.email}</p>
            </div>
          )}
          <MenuItem>
            {() => <Link href="/my-continua" className={menuItemClass}>My Continua</Link>}
          </MenuItem>
          {SHOW_PEOPLE_COMPARISON && (
            <MenuItem>
              {() => <Link href="/compare/people" className={menuItemClass}>Comparisons</Link>}
            </MenuItem>
          )}
          <MenuItem>
            {() => <Link href="/my-continua?settings=open#settings" className={menuItemClass}>Name &amp; sign-in settings</Link>}
          </MenuItem>
          <form action="/auth/signout" method="post" className="mt-1 border-t border-black/5 pt-1">
            <button type="submit" className={menuItemClass}>
              Sign out
            </button>
          </form>
        </MenuItems>
      </Menu>
    )
  }

  return (
    <div className={mobile ? 'grid w-full grid-cols-2 gap-2' : 'flex items-center gap-3'}>
      <Link href="/my-continua" onClick={onNavigate} className={linkClassName}>
        My Continua
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
