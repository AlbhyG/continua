import type { Metadata } from 'next'
import Link from 'next/link'
import DeleteAssessmentButton from './delete-assessment-button'
import LatestOrb from './latest-orb'
import NameForm from './name-form'
import PasskeySettings from './passkey-settings'
import StopSharingButton from './stop-sharing-button'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/current-user'
import { SHOW_OTHERS_VIEW, SHOW_PEOPLE_COMPARISON } from '@/lib/site-mode'
import HistoryChart from '@/components/quiz/HistoryChart'
import LocalDateTime from '@/components/LocalDateTime'
import { AXIS_INFO, type AxisScores } from '@/lib/quiz/scoring'
import { AXIS_COLORS } from '@/lib/quiz/axis-colors'

export const metadata: Metadata = {
  title: 'My Continua',
  description: 'Review your Continua assessment history.',
}

type QuizResult = {
  id: number
  questionnaire_id: number
  score: number
  scores: Partial<AxisScores> | null
  taken_at: string
}

const AXES = Object.keys(AXIS_INFO) as Array<keyof AxisScores>

export default async function MyContinuaPage() {
  const { supabase, user } = await requireUser('/my-continua')
  // These three don't depend on each other, so run them together. Results come
  // embedded with the person record, and share links are looked up by account
  // (results are attached to the account before this runs, in requireUser).
  const admin = createAdminClient()
  const [{ data: showWelcome, error: welcomeError }, { data: selfPerson }, { data: shares }] =
    await Promise.all([
      supabase.rpc('consume_first_login_welcome'),
      supabase
        .from('people')
        .select('id,name,quiz_results(id,questionnaire_id,score,scores,taken_at)')
        .eq('owner_user_id', user.id)
        .eq('is_self', true)
        .order('taken_at', { referencedTable: 'quiz_results', ascending: false })
        .single(),
      admin
        ? admin
            .from('result_share_links')
            .select('result_id, quiz_results!inner(user_id)')
            .eq('quiz_results.user_id', user.id)
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        : Promise.resolve({ data: [] as { result_id: number }[] }),
    ])
  if (welcomeError) {
    console.error('Could not record first-login welcome:', welcomeError.message)
  }

  const quizResults = ((selfPerson?.quiz_results ?? []) as QuizResult[])

  // Which of these results currently have a working share link.
  const sharedIds = new Set<number>((shares ?? []).map((share) => share.result_id))

  return (
    <main className="mx-auto max-w-[960px] px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white md:text-5xl">My Continua</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/80">
            Return to the personality snapshots you’ve taken over time.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sign out
          </button>
        </form>
      </div>

      {showWelcome && (
        <p className="glass-card mt-8 p-4 text-center font-semibold text-foreground/80">
          Welcome to Continua — your assessment history and tools are ready below.
        </p>
      )}

      {quizResults[0]?.scores && (
        <LatestOrb
          resultId={quizResults[0].id}
          scores={quizResults[0].scores}
          takenAt={quizResults[0].taken_at}
        />
      )}

      <NameForm name={typeof selfPerson?.name === 'string' ? selfPerson.name : ''} />

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Assessment history</h2>
            <p className="mt-1 text-sm text-white/70">
              See every saved assessment and how your six coordinates change over time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SHOW_OTHERS_VIEW && (
              <Link
                href="/others"
                className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                How others see you
              </Link>
            )}
            {SHOW_PEOPLE_COMPARISON && (
              <Link
                href="/compare/people"
                className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Compare
              </Link>
            )}
            <Link
              href="/quiz"
              className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-white"
            >
              {quizResults.length > 0 ? 'Take another assessment' : 'Take an assessment'}
            </Link>
          </div>
        </div>

        <div className="glass-card mt-5 p-4 text-sm text-foreground/70">
          Taking an assessment before you sign in? Sign in on the same device
          afterward and Continua will merge that result into your account automatically.
        </div>

        {quizResults.length === 0 ? (
          <div className="glass-card mt-5 p-6">
            <p className="text-foreground/70">
              You don’t have any account-linked results yet. Your next assessment
              will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            {quizResults.length >= 2 ? (
              <section id="trends" className="glass-card mt-5 scroll-mt-28 p-5 md:p-6">
                <h3 className="text-xl font-bold">Your trends</h3>
                <p className="mt-1 text-sm text-foreground/60">
                  Each line tracks one coordinate on the 1–10 scale, oldest to newest.
                </p>
                <div className="mt-5">
                  <HistoryChart data={[...quizResults].reverse()} />
                </div>
              </section>
            ) : (
              <p className="glass-card mt-5 p-4 text-sm text-foreground/70">
                Take the assessment again some other time, and a chart here will show how your
                answers compare across occasions.
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quizResults.map((result) => {
                const scores = result.scores ?? { empathy: result.score }

                return (
                  <article key={result.id} className="glass-card-interactive p-5">
                    <Link href={`/quiz/results/${result.id}`} className="block">
                    <LocalDateTime
                      iso={result.taken_at}
                      className="block text-sm font-bold text-foreground/70"
                    />
                    <div className="mt-3 flex flex-col">
                      {AXES.filter((axis) => Number.isFinite(scores[axis])).map((axis) => {
                        const value = Number(scores[axis])
                        const info = AXIS_INFO[axis]
                        return (
                          <div key={axis} className="border-t border-foreground/10 py-2 first:border-t-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold text-foreground/75">{info.name}</span>
                              <span className="text-sm font-bold tabular-nums">{value.toFixed(1)}</span>
                            </div>
                            <div
                              className="relative mx-1.5 mt-1.5 h-3"
                              role="img"
                              aria-label={`${info.name} ${value.toFixed(1)}, between ${info.lowLabel} (1) and ${info.highLabel} (10)`}
                            >
                              <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-foreground/15" />
                              <div
                                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
                                style={{ left: `${((value - 1) / 9) * 100}%`, backgroundColor: AXIS_COLORS[axis] }}
                              />
                            </div>
                            <div className="mt-0.5 flex justify-between text-[10px] text-foreground/45">
                              <span>{info.lowLabel}</span>
                              <span>{info.highLabel}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {!result.scores && (
                      <p className="mt-3 text-xs text-foreground/50">
                        Legacy result — empathy score only
                      </p>
                    )}
                    </Link>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-foreground/10 pt-2">
                      <div className="flex items-center gap-2">
                        {sharedIds.has(result.id) && (
                          <>
                            <span className="text-xs font-semibold text-foreground/60">Shared link active</span>
                            <StopSharingButton resultId={result.id} />
                          </>
                        )}
                      </div>
                      <DeleteAssessmentButton resultId={result.id} />
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* Rarely needed, so kept closed at the bottom of the page. */}
      <details className="group mt-12">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-white/30 px-5 py-4 text-lg font-bold text-white transition hover:bg-white/10 [&::-webkit-details-marker]:hidden">
          <span>
            Sign-in settings
            <span className="ml-2 text-sm font-normal text-white/70">Passkeys</span>
          </span>
          <span className="text-2xl leading-none transition-transform group-open:rotate-90" aria-hidden="true">›</span>
        </summary>
        <PasskeySettings />
      </details>
    </main>
  )
}
