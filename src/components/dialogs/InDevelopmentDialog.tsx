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
      <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <DialogPanel className="max-w-md w-full glass-card p-8 shadow-xl">
          <DialogTitle className="text-xl font-bold text-foreground">
            {feature}
          </DialogTitle>

          <p className="text-[15px] text-foreground/60 mt-3">
            This feature is coming soon.
          </p>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/85 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
