import type { AxisScores } from './scoring'

const AXES: Array<keyof AxisScores> = [
  'empathy',
  'self_orientation',
  'social_attunement',
  'conscientiousness',
  'agency',
  'reactivity',
]

export type GroupResultInput = {
  person_id: string
  scores: Partial<AxisScores> | null
  taken_at: string
}

export function averageLatestGroupScores(
  memberIds: string[],
  results: GroupResultInput[]
): { scores: AxisScores | null; assessedMemberIds: string[] } {
  const members = new Set(memberIds)
  const latest = new Map<string, GroupResultInput>()

  for (const result of results) {
    if (!members.has(result.person_id) || !result.scores) continue
    const current = latest.get(result.person_id)
    if (!current || new Date(result.taken_at) > new Date(current.taken_at)) {
      latest.set(result.person_id, result)
    }
  }

  const usable = Array.from(latest.values()).filter((result) =>
    AXES.every((axis) => Number.isFinite(result.scores?.[axis]))
  )

  if (usable.length === 0) {
    return { scores: null, assessedMemberIds: [] }
  }

  const scores = Object.fromEntries(
    AXES.map((axis) => [
      axis,
      Number(
        (
          usable.reduce((sum, result) => sum + Number(result.scores?.[axis]), 0) /
          usable.length
        ).toFixed(2)
      ),
    ])
  ) as unknown as AxisScores

  return {
    scores,
    assessedMemberIds: usable.map((result) => result.person_id),
  }
}
