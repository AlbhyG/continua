import type { Metadata } from 'next'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import FadeIn from '@/components/FadeIn'
import FamousFiguresExplorer from '@/components/famous-figures/FamousFiguresExplorer'

export const metadata: Metadata = {
  title: 'Famous Archetypal Figures',
  description:
    'Famous people believed to be on the extreme ends of the Continua personality spectra.',
}

interface Profile {
  name: string
  primary: string
  tags: string
  scores: {
    social_attunement: number
    empathy: number
    self_orientation: number
    conscientiousness: number
    agency: number
    reactivity: number
  }
}

function loadProfiles(): Profile[] {
  const filePath = path.join(process.cwd(), 'data', 'famous-figures-profiles.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as Profile[]
}

export default function FamousFiguresPage() {
  const profiles = loadProfiles()

  return (
    <div>
      {/* Back button */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-16 pb-2">
        <Link
          href="/my-info"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
          Info
        </Link>
      </section>

      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-4 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-4">
            Famous Archetypal Figures
          </h1>
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/80">
            Using the internet &mdash; not official diagnoses but the opinions of
            the crowds, here are some people that many believe to be on the
            extreme ends of the continua.{' '}
            <span className="text-white/60">
              Click any name to see their personality orb.
            </span>
          </p>
        </FadeIn>
      </section>

      {/* Category cards with clickable names */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-16">
        <FamousFiguresExplorer profiles={profiles} />
      </section>
    </div>
  )
}
