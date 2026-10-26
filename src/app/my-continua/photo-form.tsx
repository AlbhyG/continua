'use client'

import { useRef, useState } from 'react'
import { updatePhoto } from '@/app/actions/profile'

const SIZE = 128

// Crops the chosen image to its center square and shrinks it to 128 x 128,
// so only a small JPEG ever leaves the browser.
function toSquareJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('no canvas'))
      ctx.drawImage(
        img,
        (img.naturalWidth - side) / 2,
        (img.naturalHeight - side) / 2,
        side,
        side,
        0,
        0,
        SIZE,
        SIZE
      )
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable'))
    }
    img.src = url
  })
}

export default function PhotoForm({ photo, initial }: { photo: string | null; initial: string }) {
  const [current, setCurrent] = useState(photo)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function save(next: string | null) {
    setBusy(true)
    setMessage(null)
    try {
      const res = await updatePhoto(next)
      setMessage({ ok: res.ok, text: res.message })
      if (res.ok) {
        setCurrent(next)
        window.dispatchEvent(new Event('continua:photo-changed'))
      }
    } finally {
      setBusy(false)
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage({ ok: false, text: 'Please choose an image file.' })
      return
    }
    try {
      await save(await toSquareJpeg(file))
    } catch {
      setMessage({ ok: false, text: 'That image could not be read. Please try another (JPEG or PNG).' })
    }
  }

  return (
    <div className="glass-card mt-4 p-5">
      <p className="text-sm font-semibold">Your photo</p>
      <p className="mt-1 text-sm text-foreground/70">
        Shown in place of your initial at the top of the page. Only you see it.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="Your photo" className="h-14 w-14 rounded-full object-cover ring-2 ring-white/70" />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-xl font-bold text-white">
            {initial}
          </span>
        )}
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={onPick} />
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-white disabled:opacity-60"
        >
          {busy ? 'Saving…' : current ? 'Change photo' : 'Add a photo'}
        </button>
        {current && (
          <button
            type="button"
            disabled={busy}
            onClick={() => save(null)}
            className="text-sm font-semibold text-foreground/70 underline underline-offset-4 disabled:opacity-60"
          >
            Remove photo
          </button>
        )}
      </div>
      {message && (
        <p className={`mt-2 text-sm ${message.ok ? 'text-green-800' : 'text-red-700'}`} role="status">
          {message.text}
        </p>
      )}
    </div>
  )
}
