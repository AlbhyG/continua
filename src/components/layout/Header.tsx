'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SHOW_PEOPLE_COMPARISON } from '@/lib/site-mode'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import AccountButton from '@/components/auth/AccountButton'
import ContactInquiry from '@/components/ContactInquiry'
import MobileMenu from './MobileMenu'
import {
  ContactSuccessDialog,
  FirstChapterPopover,
  emptyContactForm,
  useSignedInEmail,
  type ContactFormState,
} from './FirstChapterRequest'

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

const navLinkClass = 'text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors'

const dropdownClass =
  'z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-1 ring-black/5 p-2'

const greyedItemClass =
  'block w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-400 cursor-default'

const menuItemClass =
  'block w-full text-left px-4 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-accent/5 hover:text-foreground transition-colors'

// The id of the visitor's most recent result: from this browser, or, when
// signed in on a browser that has none (a phone, after taking the assessment
// on a laptop), from the account.
function useLatestResultId(signedInEmail: string | null) {
  const [latestResultId, setLatestResultId] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => setLatestResultId(localStorage.getItem('latest_result_id'))
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('continua:latest-result', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('continua:latest-result', sync)
    }
  }, [])

  useEffect(() => {
    if (!signedInEmail || latestResultId) return
    let cancelled = false
    fetch('/quiz/api/results/latest', { cache: 'no-store' })
      .then((res) => (res.status === 200 ? res.json() : null))
      .then((data: { id: number } | null) => {
        if (cancelled || !data?.id) return
        try {
          localStorage.setItem('latest_result_id', String(data.id))
        } catch {
          // Browser storage is a convenience only.
        }
        setLatestResultId(String(data.id))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [signedInEmail, latestResultId])

  return latestResultId
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const [contactState, setContactState] = useState<ContactFormState>(emptyContactForm)
  const [contactSuccessMessage, setContactSuccessMessage] = useState<string | null>(null)
  const signedInEmail = useSignedInEmail()
  const latestResultId = useLatestResultId(signedInEmail)

  useEffect(() => setPortalReady(true), [])

  const firstChapter = {
    portalReady,
    signedInEmail,
    state: contactState,
    setState: setContactState,
    onSuccess: setContactSuccessMessage,
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/30">
        <div className="max-w-[720px] xl:max-w-[1120px] mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + mobile hamburger */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image src="/logo.png" alt="Continua" width={72} height={48} priority />
            </Link>
            <button
              className="xl:hidden p-2 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-4">
            <Menu>
              <div className="flex items-center gap-0">
                <MenuButton className="flex items-center text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors cursor-pointer">
                  Assessment
                  <span className="p-1"><ChevronDown /></span>
                </MenuButton>
              </div>
              <MenuItems anchor="bottom start" className={dropdownClass}>
                <MenuItem>
                  {() => <Link href="/quiz" className={menuItemClass}>Take an Assessment</Link>}
                </MenuItem>
                {latestResultId ? (
                  <MenuItem>
                    {() => (
                      <Link href={`/quiz/results/${latestResultId}`} className={menuItemClass}>See Results</Link>
                    )}
                  </MenuItem>
                ) : (
                  <MenuItem disabled>
                    {() => <span className={greyedItemClass}>+ See Results</span>}
                  </MenuItem>
                )}
                {SHOW_PEOPLE_COMPARISON && (
                  <MenuItem>
                    {() => <Link href="/compare/people" className={menuItemClass}>Compare with Someone</Link>}
                  </MenuItem>
                )}
                <MenuItem disabled>
                  {() => <span className={greyedItemClass}>+ Tools &amp; Actions</span>}
                </MenuItem>
              </MenuItems>
            </Menu>

            <Link href="/about" className={navLinkClass}>
              About
            </Link>
            <AccountButton />

            <FirstChapterPopover
              buttonClassName="whitespace-nowrap bg-accent text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-accent/85 transition-colors cursor-pointer ring-1 ring-accent/30"
              {...firstChapter}
            />
            <ContactInquiry />
          </nav>

          {/* First-chapter request (mobile/tablet) */}
          <div className="xl:hidden flex flex-col items-end gap-1">
            <FirstChapterPopover
              buttonClassName="max-w-[155px] bg-accent text-white rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-accent/85 transition-colors cursor-pointer ring-1 ring-accent/30"
              {...firstChapter}
            />
            <ContactInquiry compact />
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        latestResultId={latestResultId}
      />
      <ContactSuccessDialog
        message={contactSuccessMessage}
        onClose={() => setContactSuccessMessage(null)}
      />
    </>
  )
}
