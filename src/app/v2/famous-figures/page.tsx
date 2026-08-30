import type { Metadata } from 'next'
import Link from 'next/link'
import profiles from '../../../../data/famous-figures-profiles.json'
import FadeIn from '@/components/FadeIn'
import {
  FAMOUS_FIGURE_CATEGORIES,
  groupFamousFiguresByCategory,
  type FamousFigureProfile,
} from '@/lib/famous-figures'

export const metadata: Metadata = {
  title: 'Famous Archetypal Figures (v2)',
  description:
    'Famous people believed to be on the extreme ends of the Continua personality spectra.',
}

const groupedProfiles = groupFamousFiguresByCategory(profiles as FamousFigureProfile[])
const sections = FAMOUS_FIGURE_CATEGORIES.map(({ key, title }) => ({
  title,
  names: groupedProfiles.get(key)?.map(({ name }) => name).join(', ') ?? '',
}))

export default function V2FamousFiguresPage() {
  return (
    <div>
      {/* Back button */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-16 pb-2">
        <Link
          href="/v2/my-info"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
          My Info
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
            extreme ends of the continua.
          </p>
        </FadeIn>
      </section>

      {/* Category cards */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-4">
          {sections.map((section, i) => (
            <FadeIn key={section.title} delay={i * 60}>
              <div className="glass-card p-6 h-full">
                <h2 className="text-[20px] md:text-[22px] font-bold mb-2">
                  {section.title}
                </h2>
                <p className="text-[15px] md:text-[16px] leading-[1.6] text-foreground/70">
                  {section.names}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}
