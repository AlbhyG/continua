'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { scoresToOrbData } from '@/lib/quiz/orb-mapping'
import { AXIS_INFO, getAxisLabel, type AxisScores } from '@/lib/quiz/scoring'

const PersonalityOrb = dynamic(() => import('@/components/PersonalityOrb'), {
  ssr: false,
  loading: () => <div className="h-[300px]" />,
})

const RadarProfile = dynamic(() => import('@/components/quiz/RadarProfile'), {
  ssr: false,
  loading: () => <div className="h-[350px]" />,
})

const AXES: Array<keyof AxisScores> = [
  'empathy',
  'self_orientation',
  'social_attunement',
  'conscientiousness',
  'agency',
  'reactivity',
]

export default function GroupProfile({
  group,
  scores,
  members,
}: {
  group: { name: string; kind: string }
  scores: AxisScores | null
  members: Array<{
    id: string
    name: string
    isSelf: boolean
    assessed: boolean
    resultId: number | null
    scores: AxisScores | null
    takenAt: string | null
  }>
}) {
  const axisResults = scores
    ? AXES.map((axis) => ({
        axis,
        name: AXIS_INFO[axis].name,
        score: scores[axis],
        label: getAxisLabel(axis, scores[axis]),
        highLabel: AXIS_INFO[axis].highLabel,
        lowLabel: AXIS_INFO[axis].lowLabel,
      }))
    : []

  const assessedCount = members.filter((member) => member.assessed).length

  return (
    <>
      <header>
        <Link
          href="/my-relationships"
          className="text-sm font-semibold text-white/75 underline underline-offset-2"
        >
          ← My Relationships
        </Link>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-white/65">
          {group.kind} group
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white md:text-5xl">{group.name}</h1>
        <p className="mt-3 text-white/75">
          Based on {assessedCount} of {members.length}{' '}
          {members.length === 1 ? 'member' : 'members'}.
        </p>
      </header>

      {scores ? (
        <>
          <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="glass-card flex items-center justify-center p-5">
              <PersonalityOrb data={scoresToOrbData(scores)} size={300} />
            </div>
            <div className="glass-card p-5">
              <RadarProfile data={axisResults} />
            </div>
          </section>

          <section className="glass-card mt-6 p-6">
            <h2 className="text-2xl font-bold">Group coordinates</h2>
            <p className="mt-1 text-sm text-foreground/60">
              Each coordinate is the simple average of every assessed member’s
              latest result.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {axisResults.map((result) => (
                <div key={result.axis}>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="font-bold">{result.name}</p>
                      <p className="text-xs text-foreground/55">{result.label}</p>
                    </div>
                    <span className="text-xl font-bold">{result.score}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${((result.score - 1) / 9) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-foreground/45">
                    <span>{result.lowLabel}</span>
                    <span>{result.highLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="glass-card mt-8 p-7">
          <h2 className="text-2xl font-bold">This group needs assessment results</h2>
          <p className="mt-2 text-foreground/70">
            Take an assessment for at least one member to generate the group orb,
            radar, and averaged coordinates.
          </p>
        </section>
      )}

      <section className="glass-card mt-6 p-6">
        <h2 className="text-2xl font-bold">Compare members</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Each row uses that member’s latest assessment, so differences are visible
          alongside the group average.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-black/10 bg-white/45">
          <table className="min-w-[820px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-white/55 text-xs text-foreground/55">
                <th className="px-4 py-3 font-semibold">Member</th>
                {AXES.map((axis) => (
                  <th key={axis} className="px-3 py-3 text-center font-semibold">
                    {AXIS_INFO[axis].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-black/5">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    {member.resultId ? (
                      <Link
                        href={`/quiz/results/${member.resultId}`}
                        className="text-accent underline underline-offset-2"
                      >
                        {member.name} {member.isSelf ? '(You)' : ''}
                      </Link>
                    ) : (
                      <>{member.name} {member.isSelf ? '(You)' : ''}</>
                    )}
                    {member.takenAt && (
                      <span className="mt-0.5 block text-[11px] font-normal text-foreground/45">
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(new Date(member.takenAt))}
                      </span>
                    )}
                  </th>
                  {AXES.map((axis) => (
                    <td key={axis} className="px-3 py-3 text-center font-bold tabular-nums">
                      {Number.isFinite(member.scores?.[axis]) ? member.scores?.[axis] : '—'}
                    </td>
                  ))}
                </tr>
              ))}
              {scores && (
                <tr className="border-t-2 border-accent/20 bg-accent/5">
                  <th className="px-4 py-3 font-bold">Group average</th>
                  {AXES.map((axis) => (
                    <td key={axis} className="px-3 py-3 text-center font-bold tabular-nums text-accent">
                      {scores[axis]}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-white">Members</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <article key={member.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">
                    {member.name} {member.isSelf ? '(You)' : ''}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/55">
                    {member.assessed ? 'Included in this profile' : 'No result yet'}
                  </p>
                </div>
                <span
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    member.assessed ? 'bg-green-600' : 'bg-black/20'
                  }`}
                  aria-hidden
                />
              </div>
              {!member.assessed && (
                <Link
                  href={`/quiz?person=${member.id}&name=${encodeURIComponent(member.name)}`}
                  className="mt-4 inline-block text-sm font-bold text-accent underline underline-offset-2"
                >
                  Take assessment
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
