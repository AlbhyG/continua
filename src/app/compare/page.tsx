import type { Metadata } from 'next'
import Link from 'next/link'
import profiles from '../../../data/famous-figures-profiles.json'
import FadeIn from '@/components/FadeIn'
import CompareExplorer, { type CompareEntry } from '@/components/compare/CompareExplorer'
import type { FamousFigureProfile } from '@/lib/famous-figures'
import { AXIS_INFO, type AxisScores } from '@/lib/quiz/scoring'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Compare Orbs',
  description: 'Put personality orbs side by side and compare them axis by axis.',
}

const AXES = Object.keys(AXIS_INFO) as Array<keyof AxisScores>

function isComplete(scores: Partial<AxisScores> | null | undefined): scores is AxisScores {
  return !!scores && AXES.every((axis) => typeof scores[axis] === 'number')
}

// The viewer's own most recent complete result, if they are signed in.
// Anything that goes wrong here just means "no Me option" — the page still works.
async function loadMyLatest(): Promise<AxisScores | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: self } = await supabase
      .from('people')
      .select('id')
      .eq('owner_user_id', user.id)
      .eq('is_self', true)
      .single()
    if (!self) return null

    const { data: results } = await supabase
      .from('quiz_results')
      .select('scores,taken_at')
      .eq('person_id', self.id)
      .order('taken_at', { ascending: false })
      .limit(10)

    const latest = (results ?? []).find((r) => isComplete(r.scores as Partial<AxisScores> | null))
    return latest ? (latest.scores as AxisScores) : null
  } catch {
    return null
  }
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>
}) {
  const [{ p }, mine] = await Promise.all([searchParams, loadMyLatest()])

  const figures: CompareEntry[] = (profiles as FamousFigureProfile[])
    .map((fig) => ({ id: fig.name, name: fig.name, note: fig.tags, scores: fig.scores, isMe: false, group: fig.primary }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const me: CompareEntry | null = mine
    ? { id: 'me', name: 'Me', note: 'Your latest assessment', scores: mine, isMe: true }
    : null

  const initial = (p ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div>
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-16 pb-2">
        <Link
          href="/famous-figures"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
          Famous Figures
        </Link>
      </section>

      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-4 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-4">
            Compare Orbs
          </h1>
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/80">
            Pick up to three people and see their orbs side by side, then where
            each one falls on the six continua.
            {!me && (
              <span className="text-white/60">
                {' '}
                <Link href="/login?next=/compare" className="underline underline-offset-2 hover:text-white">
                  Sign in
                </Link>{' '}
                to include your own latest result.
              </span>
            )}
          </p>
        </FadeIn>
      </section>

      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-16">
        <CompareExplorer figures={figures} me={me} initial={initial} />
      </section>
    </div>
  )
}
