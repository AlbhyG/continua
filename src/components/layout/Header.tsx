'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Popover,
  PopoverButton,
  PopoverPanel,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { getStartedAction } from '@/app/actions/get-started'

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  )
}

const menuBtnClass =
  'flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors cursor-pointer'

const dropdownClass =
  'z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-1 ring-black/5 p-2'

const greyedItemClass =
  'block w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-400 cursor-default'

const menuItemClass =
  'block w-full text-left px-4 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-accent/5 hover:text-foreground transition-colors'

// ─── Contact Form ──────────────────────────────────────────

type ContactFormState = {
  values: { name: string; email: string; phone: string }
  roles: string[]
  confirmed: boolean
}

function ContactForm({
  state,
  setState,
  onSubmitted,
}: {
  state: ContactFormState
  setState: React.Dispatch<React.SetStateAction<ContactFormState>>
  onSubmitted: () => void
}) {
  const { values, roles, confirmed } = state
  const [submitting, setSubmitting] = useState(false)

  const hasContact = values.email.trim() !== '' || values.phone.trim() !== ''
  const canSubmit = values.name.trim() !== '' && hasContact && confirmed

  const setValues = (updater: (v: ContactFormState['values']) => ContactFormState['values']) =>
    setState((s) => ({ ...s, values: updater(s.values) }))

  const toggleRole = (role: string) => {
    setState((s) => ({
      ...s,
      roles: s.roles.includes(role)
        ? s.roles.filter((r) => r !== role)
        : [...s.roles, role],
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await getStartedAction({
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      roles,
    })
    setSubmitting(false)
    setState({ values: { name: '', email: '', phone: '' }, roles: [], confirmed: false })
    onSubmitted()
  }

  return (
    <div className="p-5 space-y-3">
      <div className="space-y-2">
        <p className="text-sm font-bold text-foreground">Role</p>
        {['Agent', 'Publisher', 'Therapist', 'Interested Reader'].map(
          (role) => (
            <label key={role} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() => toggleRole(role)}
                className="rounded border-gray-300"
              />
              {role}
            </label>
          )
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>
      <p className="text-xs text-gray-400 text-center">And / Or</p>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>
      <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setState((s) => ({ ...s, confirmed: e.target.checked }))}
          className="rounded border-gray-300"
        />
        OK to contact me?
      </label>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !canSubmit}
        className="w-full mt-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {submitting ? 'Sending...' : 'Contact me'}
      </button>
    </div>
  )
}

// ─── Mobile Menu ───────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
  versionPrefix,
  latestResultId,
}: {
  open: boolean
  onClose: () => void
  versionPrefix: string
  latestResultId: string | null
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />
      <div className="fixed inset-0 z-[60]">
        <DialogPanel className="w-[300px] h-full bg-white/90 backdrop-blur-xl p-6 overflow-y-auto shadow-2xl">
          <DialogTitle className="sr-only">Navigation</DialogTitle>

          <div className="flex justify-end mb-6">
            <button onClick={onClose} className="p-1 cursor-pointer text-foreground/60 hover:text-foreground transition-colors" aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>

          {/* Info */}
          <div className="mb-8">
            <Link
              href={`${versionPrefix}/my-info`}
              onClick={onClose}
              className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3 block hover:text-foreground transition-colors"
            >
              Info
            </Link>
            <div className="space-y-1">
              <Link href="/quiz" onClick={onClose} className="block text-[15px] text-foreground/80 py-2 px-3 hover:text-foreground transition-colors">
                Take an Assessment
              </Link>
              {latestResultId ? (
                <Link
                  href={`/quiz/results/${latestResultId}`}
                  onClick={onClose}
                  className="block text-[15px] text-foreground/80 py-2 px-3 hover:text-foreground transition-colors"
                >
                  See Results
                </Link>
              ) : (
                <span className="block text-[15px] text-gray-400 py-2 px-3">
                  + See Results
                </span>
              )}
              <span className="block text-[15px] text-gray-400 py-2 px-3">
                + Tools &amp; Actions
              </span>
            </div>
          </div>

          {/* My Relationships */}
          <div className="mb-8">
            <Link
              href={`${versionPrefix}/my-relationships`}
              onClick={onClose}
              className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3 block hover:text-foreground transition-colors"
            >
              My Relationships
            </Link>
            <div className="space-y-1">
              <span className="block text-[15px] text-gray-400 py-2 px-3">
                + Add a Person
              </span>
              <span className="block text-[15px] text-gray-400 py-2 px-3">
                + Add a Group
              </span>
              <div className="ml-3 border-l-2 border-gray-200 pl-3 space-y-1">
                <span className="block text-sm text-gray-400 py-1.5 px-3">
                  Family
                </span>
                <span className="block text-sm text-gray-400 py-1.5 px-3">
                  Friend
                </span>
                <span className="block text-sm text-gray-400 py-1.5 px-3">
                  Team
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/about"
            onClick={onClose}
            className="text-xs font-semibold text-foreground/60 uppercase tracking-wider block hover:text-foreground transition-colors"
          >
            About
          </Link>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

// ─── Header ────────────────────────────────────────────────────

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [latestResultId, setLatestResultId] = useState<string | null>(null)
  const [contactState, setContactState] = useState<ContactFormState>({
    values: { name: '', email: '', phone: '' },
    roles: [],
    confirmed: false,
  })
  const pathname = usePathname()
  const versionMatch = pathname.match(/^\/(v\d+)(?:\/|$)/)
  const versionPrefix = versionMatch ? `/${versionMatch[1]}` : ''

  useEffect(() => {
    setLatestResultId(localStorage.getItem('latest_result_id'))

    const syncLatestResult = () => {
      setLatestResultId(localStorage.getItem('latest_result_id'))
    }

    window.addEventListener('storage', syncLatestResult)
    window.addEventListener('continua:latest-result', syncLatestResult)

    return () => {
      window.removeEventListener('storage', syncLatestResult)
      window.removeEventListener('continua:latest-result', syncLatestResult)
    }
  }, [])

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/30">
        <div className="max-w-[720px] lg:max-w-[960px] mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + mobile hamburger */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Continua"
                width={72}
                height={48}
                priority
              />
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {/* Info — clickable link with dropdown */}
            <Menu>
              <div className="flex items-center gap-0">
                <Link href={`${versionPrefix}/my-info`} className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors">
                  Info
                </Link>
                <MenuButton className="p-1 text-foreground/80 hover:text-foreground transition-colors cursor-pointer">
                  <ChevronDown />
                </MenuButton>
              </div>
              <MenuItems anchor="bottom start" className={dropdownClass}>
                <MenuItem>
                  {() => (
                    <Link href="/quiz" className={menuItemClass}>Take an Assessment</Link>
                  )}
                </MenuItem>
                {latestResultId ? (
                  <MenuItem>
                    {() => (
                      <Link href={`/quiz/results/${latestResultId}`} className={menuItemClass}>See Results</Link>
                    )}
                  </MenuItem>
                ) : (
                  <MenuItem disabled>
                    {() => (
                      <span className={greyedItemClass}>+ See Results</span>
                    )}
                  </MenuItem>
                )}
                <MenuItem disabled>
                  {() => (
                    <span className={greyedItemClass}>+ Tools &amp; Actions</span>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>

            {/* My Relationships — clickable link with greyed-out dropdown */}
            <Menu>
              <div className="flex items-center gap-0">
                <Link href={`${versionPrefix}/my-relationships`} className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors">
                  My Relationships
                </Link>
                <MenuButton className="p-1 text-foreground/80 hover:text-foreground transition-colors cursor-pointer">
                  <ChevronDown />
                </MenuButton>
              </div>
              <MenuItems anchor="bottom start" className={dropdownClass}>
                <MenuItem disabled>
                  {() => (
                    <span className={greyedItemClass}>+ Add a Person</span>
                  )}
                </MenuItem>
                <MenuItem disabled>
                  {() => (
                    <span className={greyedItemClass}>+ Add a Group</span>
                  )}
                </MenuItem>
                <div className="ml-6 border-l-2 border-gray-200 pl-2">
                  <MenuItem disabled>
                    {() => (
                      <span className={greyedItemClass}>Family</span>
                    )}
                  </MenuItem>
                  <MenuItem disabled>
                    {() => (
                      <span className={greyedItemClass}>Friend</span>
                    )}
                  </MenuItem>
                  <MenuItem disabled>
                    {() => (
                      <span className={greyedItemClass}>Team</span>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>

            <Link href="/about" className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors">
              About
            </Link>

            {/* Contact me (desktop) */}
            <Popover className="relative">
              <PopoverButton className="bg-accent text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-accent/85 transition-colors cursor-pointer ring-1 ring-accent/30">
                Contact me
              </PopoverButton>
              <PopoverPanel
                anchor="bottom end"
                className="z-[100] mt-2 w-[280px] rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-2 ring-black/10"
              >
                {({ close }) => (
                  <ContactForm
                    state={contactState}
                    setState={setContactState}
                    onSubmitted={() => close()}
                  />
                )}
              </PopoverPanel>
            </Popover>
          </nav>

          {/* Mobile Contact me */}
          <div className="md:hidden">
            <Popover className="relative">
              <PopoverButton className="bg-accent text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-accent/85 transition-colors cursor-pointer ring-1 ring-accent/30">
                Contact me
              </PopoverButton>
              <PopoverPanel
                anchor="bottom end"
                className="z-[100] mt-2 w-[280px] rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-2 ring-black/10"
              >
                {({ close }) => (
                  <ContactForm
                    state={contactState}
                    setState={setContactState}
                    onSubmitted={() => close()}
                  />
                )}
              </PopoverPanel>
            </Popover>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        versionPrefix={versionPrefix}
        latestResultId={latestResultId}
      />
    </>
  )
}
