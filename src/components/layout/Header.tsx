'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import PublishersDialog from '@/components/dialogs/PublishersDialog'
import AgentsDialog from '@/components/dialogs/AgentsDialog'
import TherapistsDialog from '@/components/dialogs/TherapistsDialog'

const whoItems = [
  { href: '/who', label: 'Individuals' },
  { href: '/who', label: 'Couples' },
  { href: '/who', label: 'Families' },
  { href: '/who', label: 'Teams' },
]

const whatItems = [
  { href: '/what', label: 'Take a Test' },
  { href: '/what', label: 'See Results' },
  { href: '/what', label: 'Tools and Actions' },
]

const bookItems = [
  { label: 'Publishers' },
  { label: 'Agents' },
  { label: 'Therapists' },
]

export default function Header() {
  const pathname = usePathname()
  const isWhoPage = pathname === '/who'
  const isWhatPage = pathname === '/what'

  const [showPublishers, setShowPublishers] = useState(false)
  const [showAgents, setShowAgents] = useState(false)
  const [showTherapists, setShowTherapists] = useState(false)

  return (
    <>
    <header className="fixed top-0 inset-x-0 z-50 bg-accent backdrop-blur">
      <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Continua"
            width={72}
            height={48}
            priority
          />
        </Link>

        <nav className="flex items-center gap-2">
          <Menu>
            <MenuButton
              disabled={isWhoPage}
              className={`rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white transition-colors ${
                isWhoPage ? 'opacity-50 cursor-default' : 'hover:bg-white/35'
              }`}
            >
              Who
            </MenuButton>
            {!isWhoPage && (
              <MenuItems
                anchor="bottom start"
                className="z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
              >
                {whoItems.map((item) => (
                  <MenuItem key={item.label}>
                    {({ focus }) => (
                      <Link
                        href={item.href}
                        className={`block px-4 py-2 rounded-lg text-sm ${
                          focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            )}
          </Menu>
          <Menu>
            <MenuButton
              disabled={isWhatPage}
              className={`rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white transition-colors ${
                isWhatPage ? 'opacity-50 cursor-default' : 'hover:bg-white/35'
              }`}
            >
              What
            </MenuButton>
            {!isWhatPage && (
              <MenuItems
                anchor="bottom start"
                className="z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
              >
                {whatItems.map((item) => (
                  <MenuItem key={item.label}>
                    {({ focus }) => (
                      <Link
                        href={item.href}
                        className={`block px-4 py-2 rounded-lg text-sm ${
                          focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            )}
          </Menu>
          <Menu>
            <MenuButton className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors">
              Book
            </MenuButton>
            <MenuItems
              anchor="bottom start"
              className="z-[100] mt-2 min-w-[200px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
            >
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => setShowPublishers(true)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                      focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                    }`}
                  >
                    Publishers
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => setShowAgents(true)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                      focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                    }`}
                  >
                    Agents
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => setShowTherapists(true)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                      focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                    }`}
                  >
                    Therapists
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
          <button
            type="button"
            className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors"
          >
            Sign In
          </button>
        </nav>
      </div>
    </header>

    <PublishersDialog isOpen={showPublishers} onClose={() => setShowPublishers(false)} />
    <AgentsDialog isOpen={showAgents} onClose={() => setShowAgents(false)} />
    <TherapistsDialog isOpen={showTherapists} onClose={() => setShowTherapists(false)} />
    </>
  )
}
