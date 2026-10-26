'use client'

import Link from 'next/link'
import { SHOW_PEOPLE_COMPARISON } from '@/lib/site-mode'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import AccountButton from '@/components/auth/AccountButton'

// The slide-out menu used below desktop width.

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  )
}

const sectionClass =
  'text-xs font-semibold text-foreground/60 uppercase tracking-wider block hover:text-foreground transition-colors'
const itemClass = 'block text-[15px] text-foreground/80 py-2 px-3 hover:text-foreground transition-colors'
const greyedClass = 'block text-[15px] text-gray-400 py-2 px-3'

export default function MobileMenu({
  open,
  onClose,
  latestResultId,
}: {
  open: boolean
  onClose: () => void
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

          <div className="mb-8">
            <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3 block">
              Assessment
            </span>
            <div className="space-y-1">
              <Link href="/quiz" onClick={onClose} className={itemClass}>
                Take an Assessment
              </Link>
              {latestResultId ? (
                <Link href={`/quiz/results/${latestResultId}`} onClick={onClose} className={itemClass}>
                  See Results
                </Link>
              ) : (
                <span className={greyedClass}>+ See Results</span>
              )}
              {SHOW_PEOPLE_COMPARISON && (
                <Link href="/compare/people" onClick={onClose} className={itemClass}>
                  Comparisons
                </Link>
              )}
              <span className={greyedClass}>+ Tools &amp; Actions</span>
            </div>
          </div>

          <Link href="/about" onClick={onClose} className={sectionClass}>
            About
          </Link>
          <div className="mt-8">
            <AccountButton mobile onNavigate={onClose} />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
