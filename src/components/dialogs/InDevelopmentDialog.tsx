'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

interface InDevelopmentDialogProps {
  isOpen: boolean
  onClose: () => void
  feature: string
}

export default function InDevelopmentDialog({ isOpen, onClose, feature }: InDevelopmentDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <DialogPanel className="max-w-md w-full rounded-xl bg-white/95 backdrop-blur shadow-lg p-6">
          <DialogTitle className="text-lg font-bold text-foreground">
            {feature}
          </DialogTitle>

          <p className="text-sm text-gray-600 mt-2">
            This feature is in development.
          </p>

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
