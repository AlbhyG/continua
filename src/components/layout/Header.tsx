'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
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
          <button
            type="button"
            className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors"
          >
            Who
          </button>
          <button
            type="button"
            className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors"
          >
            What
          </button>
          <button
            type="button"
            className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors"
          >
            Book
          </button>
          <button
            type="button"
            className="rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-colors"
          >
            Sign In
          </button>
        </nav>
      </div>
    </header>
  )
}
