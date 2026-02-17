'use client'

import { useEffect } from 'react'

const TOP_COLOR = 'rgb(62, 109, 222)'
const BOTTOM_COLOR = 'rgb(229, 158, 221)'

export default function OverscrollColor() {
  useEffect(() => {
    const html = document.documentElement
    let isTop = true

    const update = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const atBottom = scrollTop + clientHeight >= scrollHeight - 100
      const nearTop = scrollTop < 100 && !atBottom

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
