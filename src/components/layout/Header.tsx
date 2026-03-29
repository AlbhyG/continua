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

const menuBtnClass =
  'flex items-center gap-1.5 text-sm font-bold text-foreground hover:opacity-70 transition-opacity cursor-pointer'

const dropdownClass =
  'z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2'

function itemClass(focus: boolean) {
  return `block w-full text-left px-4 py-2 rounded-lg text-sm ${focus ? 'bg-accent/10 text-accent' : 'text-gray-700'}`
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
      <div className="p-4 space-y-3">
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
      <div className="p-4 space-y-3">
        <p className="text-sm font-bold text-foreground">I am a:</p>
        {['Agent', 'Publisher', 'Psychologist', 'Interested Reader'].map(
          (role) => (
            <label key={role} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() => toggleRole(role)}
                className="rounded"
              />
              {role}
            </label>
          )
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || roles.length === 0}
          className="w-full mt-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <p className="text-xs text-gray-500 text-center">And / Or</p>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer pt-1">
        <input
          type="checkbox"
          disabled={!values.name.trim() || !hasContact}
          onChange={() => setShowRoles(true)}
          className="rounded"
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
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" />
      <div className="fixed inset-0 z-[60]">
        <DialogPanel className="w-[300px] h-full bg-accent-light/90 backdrop-blur-md p-6 overflow-y-auto">
          <DialogTitle className="sr-only">Navigation</DialogTitle>

          {/* My Info */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground mb-2">My Info</h3>
            <div className="ml-4 space-y-1">
              <Link
                href="/graphic-exemplar"
                onClick={onClose}
                className="block text-sm text-foreground py-1"
              >
                Graphic Exemplar
              </Link>
              <button
                onClick={() => handleCS('Take a Test')}
                className="block text-sm text-foreground py-1 cursor-pointer"
              >
                Take a Test
              </button>
              <button
                onClick={() => handleCS('My Results')}
                className="block text-sm text-foreground py-1 cursor-pointer"
              >
                My Results
              </button>
            </div>
          </div>

          {/* My Relationships */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground mb-2">My Relationships</h3>
            <div className="ml-4 space-y-1">
              <button
                onClick={() => handleCS('Add a Person')}
                className="block text-sm text-foreground py-1 cursor-pointer"
              >
                + Add a Person
              </button>
              <button
                onClick={() => handleCS('Add a Group')}
                className="block text-sm text-foreground py-1 cursor-pointer"
              >
                + Add a Group
              </button>
              <div className="ml-4 space-y-1 border-l border-foreground/30 pl-3">
                <button
                  onClick={() => handleCS('Family')}
                  className="flex items-center gap-1 text-sm text-foreground py-1 cursor-pointer"
                >
                  <span className="text-foreground/50">&#x2192;</span> Family
                </button>
                <button
                  onClick={() => handleCS('Friend')}
                  className="flex items-center gap-1 text-sm text-foreground py-1 cursor-pointer"
                >
                  <span className="text-foreground/50">&#x2192;</span> Friend
                </button>
                <button
                  onClick={() => handleCS('Team')}
                  className="flex items-center gap-1 text-sm text-foreground py-1 cursor-pointer"
                >
                  <span className="text-foreground/50">&#x2192;</span> Team
                </button>
              </div>
            </div>
          </div>

          {/* My Projects */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground mb-2">My Projects</h3>
            <div className="ml-4 space-y-1">
              <button
                onClick={() => handleCS('New Project')}
                className="block text-sm text-foreground py-1 cursor-pointer"
              >
                + Project
              </button>
              <Link
                href="/famous-figures"
                onClick={onClose}
                className="block text-sm text-foreground py-1"
              >
                Famous Archetypal Figures
              </Link>
              <Link
                href="/graphic-exemplar"
                onClick={onClose}
                className="block text-sm text-foreground py-1"
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
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-sm">
        <div className="max-w-[720px] lg:max-w-[960px] mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + mobile hamburger */}
          <div className="flex items-center gap-2">
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
              className="md:hidden p-1 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {/* My Info */}
            <Menu>
              <MenuButton className={menuBtnClass}>
                <ChevronDown /> My Info
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
                <ChevronDown /> My Relationships
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
                <div className="ml-6 border-l border-gray-300 pl-2">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        onClick={() => handleComingSoon('Family')}
                        className={itemClass(focus)}
                      >
                        <span className="text-gray-400 mr-1">&#x2192;</span> Family
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
                        <span className="text-gray-400 mr-1">&#x2192;</span> Friend
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
                        <span className="text-gray-400 mr-1">&#x2192;</span> Team
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>

            {/* My Projects */}
            <Menu>
              <MenuButton className={menuBtnClass}>
                <ChevronDown /> My Projects
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
              <PopoverButton className={menuBtnClass}>
                <ChevronDown /> Get Started
              </PopoverButton>
              <PopoverPanel
                anchor="bottom end"
                className="z-[100] mt-2 w-[260px] rounded-xl bg-white/95 backdrop-blur shadow-lg"
              >
                <GetStartedForm onComplete={() => {}} />
              </PopoverPanel>
            </Popover>
          </nav>

          {/* Mobile Get Started */}
          <div className="md:hidden">
            <Popover className="relative">
              <PopoverButton className="text-sm font-bold text-foreground cursor-pointer">
                Get Started
              </PopoverButton>
              <PopoverPanel
                anchor="bottom end"
                className="z-[100] mt-2 w-[260px] rounded-xl bg-white/95 backdrop-blur shadow-lg"
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
