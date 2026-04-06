export interface Version {
  slug: string
  name: string
  date: string
  description: string
  aliases?: string[]
}

export const versions: Version[] = [
  {
    slug: 'v1',
    name: 'April 2026',
    date: '2026-04-06',
    description: 'Initial site with glassmorphism design, six dimensions, and personality orbs',
    aliases: ['april-2026'],
  },
  {
    slug: 'v2',
    name: 'April 2026 Book Alignment',
    date: '2026-04-06',
    description: 'Aligned axis terminology with book (Empathy↔Detachment, Assertive↔Yielding), added How We Feel/Act grouping, meta-awareness, and expanded Famous Figures',
    aliases: ['book-aligned'],
  },
]

export function getVersion(slug: string): Version | undefined {
  return versions.find(
    (v) => v.slug === slug || v.aliases?.includes(slug)
  )
}

export function isValidVersion(slug: string): boolean {
  return !!getVersion(slug)
}
