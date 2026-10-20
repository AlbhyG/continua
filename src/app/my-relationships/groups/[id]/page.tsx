import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GroupProfile from './group-profile'
import { requireUser } from '@/lib/auth/current-user'
import {
  averageLatestGroupScores,
  type GroupResultInput,
} from '@/lib/quiz/group-scoring'
import type { AxisScores } from '@/lib/quiz/scoring'

export const metadata: Metadata = {
  title: 'Group Profile',
}

type MemberRow = {
  person_id: string
}

type PersonRow = {
  id: string
  name: string
  is_self: boolean
}

type ResultRow = GroupResultInput & {
  id: number
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase, user } = await requireUser(`/my-relationships/groups/${id}`)
  const { data: group } = await supabase
    .from('groups')
    .select('id,name,kind')
    .eq('id', id)
    .eq('owner_user_id', user.id)
    .single()

  if (!group) {
    notFound()
  }

  const { data: memberData } = await supabase
    .from('group_members')
    .select('person_id')
    .eq('group_id', id)

  const memberIds = ((memberData ?? []) as MemberRow[]).map(
    (member) => member.person_id
  )
  const [{ data: peopleData }, { data: resultsData }] = await Promise.all([
    memberIds.length
      ? supabase
          .from('people')
          .select('id,name,is_self')
          .in('id', memberIds)
      : Promise.resolve({ data: [] }),
    memberIds.length
      ? supabase
          .from('quiz_results')
          .select('id,person_id,scores,taken_at')
          .in('person_id', memberIds)
          .order('taken_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  const { scores, assessedMemberIds } = averageLatestGroupScores(
    memberIds,
    (resultsData ?? []) as GroupResultInput[]
  )
  const assessed = new Set(assessedMemberIds)
  const latestByPerson = new Map<string, ResultRow>()
  for (const result of (resultsData ?? []) as ResultRow[]) {
    if (!latestByPerson.has(result.person_id)) {
      latestByPerson.set(result.person_id, result)
    }
  }
  const members = ((peopleData ?? []) as PersonRow[])
    .map((person) => {
      const latest = latestByPerson.get(person.id)
      return {
        id: person.id,
        name: person.name,
        isSelf: person.is_self,
        assessed: assessed.has(person.id),
        resultId: latest?.id ?? null,
        scores: (latest?.scores as AxisScores | null | undefined) ?? null,
        takenAt: latest?.taken_at ?? null,
      }
    })
    .sort((a, b) => Number(b.isSelf) - Number(a.isSelf) || a.name.localeCompare(b.name))

  return (
    <main className="mx-auto max-w-[960px] px-6 py-16">
      <GroupProfile
        group={{ name: group.name, kind: group.kind }}
        scores={scores}
        members={members}
      />
    </main>
  )
}
