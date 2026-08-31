import type { Metadata } from 'next'
import Link from 'next/link'
import ProfileForm from './profile-form'
import { requireUser } from '@/lib/auth/current-user'
import HistoryChart from '@/components/quiz/HistoryChart'
import { AXIS_INFO, type AxisScores } from '@/lib/quiz/scoring'

export const metadata: Metadata = {
  title: 'My Info',
  description: 'Manage your Continua profile and assessment history.',
}

type QuizResult = {
  id: number
  questionnaire_id: number
  score: number
  scores: Partial<AxisScores> | null
  taken_at: string
}

const AXES = Object.keys(AXIS_INFO) as Array<keyof AxisScores>

export default async function MyInfoPage() {
  const { supabase, user } = await requireUser('/my-info')
  const [{ data: profile }, { data: selfPerson }] = await Promise.all([
    supabase
      .from('contacts')
      .select('name,email,phone,interest_roles')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('people')
      .select('id')
      .eq('owner_user_id', user.id)
      .eq('is_self', true)
      .single(),
  ])
  const { data: results } = selfPerson
    ? await supabase
      .from('quiz_results')
      .select('id,questionnaire_id,score,scores,taken_at')
      .eq('person_id', selfPerson.id)
      .order('taken_at', { ascending: false })
    : { data: [] }

  const quizResults = (results ?? []) as QuizResult[]

  return (
    <main className="mx-auto max-w-[960px] px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            Your Continua
          </p>
          <h1 className="mt-2 text-4xl font-bold text-white md:text-5xl">My Info</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/80">
            Keep your contact information current and return to the personality
            snapshots you’ve taken over time.
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

      <section className="glass-card mt-8 p-6 md:p-8">
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="mt-1 text-sm text-foreground/65">
          This is the information Continua stores for your account.
        </p>
        <div className="mt-6">
          <ProfileForm
            profile={{
              name: profile?.name ?? user.user_metadata.name ?? '',
              email: profile?.email ?? user.email ?? '',
              phone: profile?.phone ?? '',
              roles: profile?.interest_roles ?? [],
            }}
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Assessment history</h2>
            <p className="mt-1 text-sm text-white/70">
              See every saved assessment and how your six coordinates change over time.
            </p>
          </div>
          <Link
            href="/quiz"
            className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-white"
          >
            Take an assessment
          </Link>
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
            <section className="glass-card mt-5 p-5 md:p-6">
              <h3 className="text-xl font-bold">Your trends</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Each line tracks one coordinate on the 1–10 scale, oldest to newest.
              </p>
              <div className="mt-5">
                <HistoryChart data={[...quizResults].reverse()} />
              </div>
            </section>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quizResults.map((result) => {
                const scores = result.scores ?? { empathy: result.score }

                return (
                  <Link
                    key={result.id}
                    href={`/quiz/results/${result.id}`}
                    className="glass-card-interactive block p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-foreground/45">
                        Assessment {result.questionnaire_id}
                      </p>
                      <time className="text-xs text-foreground/55">
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(new Date(result.taken_at))}
                      </time>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {AXES.filter((axis) => Number.isFinite(scores[axis])).map(
                        (axis) => (
                          <div key={axis} className="rounded-lg bg-white/45 px-3 py-2">
                            <p className="truncate text-[11px] font-semibold text-foreground/55">
                              {AXIS_INFO[axis].name}
                            </p>
                            <p className="mt-0.5 text-lg font-bold">{scores[axis]}</p>
                          </div>
                        )
                      )}
                    </div>
                    {!result.scores && (
                      <p className="mt-3 text-xs text-foreground/50">
                        Legacy result — empathy score only
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
