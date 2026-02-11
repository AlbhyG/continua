'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react'

interface AgentsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function AgentsDialog({ isOpen, onClose }: AgentsDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <DialogPanel className="max-w-md w-full rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
          <DialogTitle className="text-lg font-bold text-foreground">
            We will send you a proposal
          </DialogTitle>

          <Description className="text-sm text-gray-600 mt-2">
            Enter your email or phone number
          </Description>

          <div className="mt-4 space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="tel"
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
