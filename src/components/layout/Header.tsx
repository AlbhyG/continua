'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  CloseButton,
} from '@headlessui/react'
import InDevelopmentDialog from '@/components/dialogs/InDevelopmentDialog'
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

function itemClass(focus: boolean) {
  return `block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${focus ? 'bg-accent/10 text-accent' : 'text-gray-700'}`
}

// ─── Get Started Form ──────────────────────────────────────────

function GetStartedForm({ onComplete }: { onComplete: () => void }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '' })
  const [showRoles, setShowRoles] = useState(false)
  const [roles, setRoles] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const hasContact = values.email.trim() !== '' || values.phone.trim() !== ''

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
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
    setDone(true)
  }

  if (done) {
    return (
      <div className="p-5 space-y-3">
        <p className="text-sm font-bold text-foreground">Thank you!</p>
        <p className="text-sm text-gray-600">We&apos;ll be in touch.</p>
        <CloseButton className="text-sm text-accent hover:underline cursor-pointer">
          Close
        </CloseButton>
      </div>
    )
  }

  if (showRoles) {
    return (
      <div className="p-5 space-y-3">
        <p className="text-sm font-bold text-foreground">I am a:</p>
        {['Agent', 'Publisher', 'Psychologist', 'Interested Reader'].map(
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
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || roles.length === 0}
          className="w-full mt-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-3">
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
          disabled={!values.name.trim() || !hasContact}
          onChange={() => setShowRoles(true)}
          className="rounded border-gray-300"
        />
        OK
      </label>
    </div>
  )
}

// ─── Mobile Menu ───────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
  onComingSoon,
}: {
  open: boolean
  onClose: () => void
  onComingSoon: (feature: string) => void
}) {
  const handleCS = (feature: string) => {
    onClose()
    onComingSoon(feature)
  }

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

          {/* My Info */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">My Info</h3>
            <div className="space-y-1">
              <Link
                href="/graphic-exemplar"
                onClick={onClose}
                className="block text-[15px] text-foreground/80 hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent/5 transition-colors"
              >
                Graphic Exemplar
              </Link>
              <button
                onClick={() => handleCS('Take a Test')}
                className="block w-full text-left text-[15px] text-foreground/80 hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
              >
                Take a Test
              </button>
              <button
                onClick={() => handleCS('My Results')}
                className="block w-full text-left text-[15px] text-foreground/80 hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
              >
                My Results
              </button>
            </div>
          </div>

          {/* My Relationships */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">My Relationships</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCS('Add a Person')}
                className="block w-full text-left text-[15px] text-foreground/80 hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
              >
                + Add a Person
              </button>
              <button
                onClick={() => handleCS('Add a Group')}
                className="block w-full text-left text-[15px] text-foreground/80 hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
              >
                + Add a Group
              </button>
              <div className="ml-3 border-l-2 border-accent/15 pl-3 space-y-1">
                <button
                  onClick={() => handleCS('Family')}
                  className="block w-full text-left text-sm text-foreground/60 hover:text-foreground py-1.5 px-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                >
                  Family
                </button>
                <button
                  onClick={() => handleCS('Friend')}
                  className="block w-full text-left text-sm text-foreground/60 hover:text-foreground py-1.5 px-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                >
                  Friend
                </button>
                <button
                  onClick={() => handleCS('Team')}
                  className="block w-full text-left text-sm text-foreground/60 hover:text-foreground py-1.5 px-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                >
                  Team
                </button>
              </div>
            </div>
          </div>

          {/* My Projects */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">My Projects</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCS('New Project')}
                className="block w-full text-left text-[15px] text-foreground/80 hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
              >
                + Project
              </button>
              <Link
                href="/famous-figures"
                onClick={onClose}
                className="block text-[15px] text-foreground/80 hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent/5 transition-colors"
              >
                Famous Archetypal Figures
              </Link>
              <Link
                href="/graphic-exemplar"
                onClick={onClose}
                className="block text-[15px] text-foreground/80 hover:text-foreground py-2 px-3 rounded-lg hover:bg-accent/5 transition-colors"
              >
                Graphic Exemplar
              </Link>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

// ─── Header ────────────────────────────────────────────────────

export default function Header() {
  const [comingSoon, setComingSoon] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleComingSoon = useCallback((feature: string) => {
    setComingSoon(feature)
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
            {/* My Info */}
            <Menu>
              <MenuButton className={menuBtnClass}>
                My Info <ChevronDown />
              </MenuButton>
              <MenuItems anchor="bottom start" className={dropdownClass}>
                <MenuItem>
                  {({ focus }) => (
                    <Link href="/graphic-exemplar" className={itemClass(focus)}>
                      Graphic Exemplar
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => handleComingSoon('Take a Test')}
                      className={itemClass(focus)}
                    >
                      Take a Test
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => handleComingSoon('My Results')}
                      className={itemClass(focus)}
                    >
                      My Results
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>

            {/* My Relationships */}
            <Menu>
              <MenuButton className={menuBtnClass}>
                My Relationships <ChevronDown />
              </MenuButton>
              <MenuItems anchor="bottom start" className={dropdownClass}>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => handleComingSoon('Add a Person')}
                      className={itemClass(focus)}
                    >
                      + Add a Person
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => handleComingSoon('Add a Group')}
                      className={itemClass(focus)}
                    >
                      + Add a Group
                    </button>
                  )}
                </MenuItem>
                {/* Sub-items with tree connector */}
                <div className="ml-6 border-l-2 border-accent/15 pl-2">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        onClick={() => handleComingSoon('Family')}
                        className={itemClass(focus)}
                      >
                        Family
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        onClick={() => handleComingSoon('Friend')}
                        className={itemClass(focus)}
                      >
                        Friend
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        onClick={() => handleComingSoon('Team')}
                        className={itemClass(focus)}
                      >
                        Team
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>

            {/* My Projects */}
            <Menu>
              <MenuButton className={menuBtnClass}>
                My Projects <ChevronDown />
              </MenuButton>
              <MenuItems anchor="bottom start" className={dropdownClass}>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => handleComingSoon('New Project')}
                      className={itemClass(focus)}
                    >
                      + Project
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/famous-figures"
                      className={itemClass(focus)}
                    >
                      Famous Archetypal Figures
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/graphic-exemplar"
                      className={itemClass(focus)}
                    >
                      Graphic Exemplar
                    </Link>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>

            {/* Get Started (desktop) */}
            <Popover className="relative">
              <PopoverButton className="bg-accent text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-accent/85 transition-colors cursor-pointer">
                Get Started
              </PopoverButton>
              <PopoverPanel
                anchor="bottom end"
                className="z-[100] mt-2 w-[280px] rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-1 ring-black/5"
              >
                <GetStartedForm onComplete={() => {}} />
              </PopoverPanel>
            </Popover>
          </nav>

          {/* Mobile Get Started */}
          <div className="md:hidden">
            <Popover className="relative">
              <PopoverButton className="bg-accent text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-accent/85 transition-colors cursor-pointer">
                Get Started
              </PopoverButton>
              <PopoverPanel
                anchor="bottom end"
                className="z-[100] mt-2 w-[280px] rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-1 ring-black/5"
              >
                <GetStartedForm onComplete={() => {}} />
              </PopoverPanel>
            </Popover>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onComingSoon={handleComingSoon}
      />

      {/* Coming Soon dialog */}
      <InDevelopmentDialog
        isOpen={comingSoon !== null}
        onClose={() => setComingSoon(null)}
        feature={comingSoon ?? ''}
      />
    </>
  )
}
