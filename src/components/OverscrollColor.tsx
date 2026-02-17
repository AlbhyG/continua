'use client'

import { useEffect } from 'react'

const TOP_COLOR = 'rgb(62, 109, 222)'
const BOTTOM_COLOR = 'rgb(229, 158, 221)'

export default function OverscrollColor() {
  useEffect(() => {
    const html = document.documentElement
    let isTop = true

    const update = () => {
      const nearTop = window.scrollY < 100
      if (nearTop && !isTop) {
        html.style.backgroundColor = TOP_COLOR
        isTop = true
      } else if (!nearTop && isTop) {
        html.style.backgroundColor = BOTTOM_COLOR
        isTop = false
      }
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return null
}
