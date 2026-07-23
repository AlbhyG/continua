import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GroupProfile from './group-profile'
import { requireUser } from '@/lib/auth/current-user'
import {
  averageLatestGroupScores,
  type GroupResultInput,
} from '@/lib/quiz/group-scoring'

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
          .select('person_id,scores,taken_at')
          .in('person_id', memberIds)
          .order('taken_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  const { scores, assessedMemberIds } = averageLatestGroupScores(
    memberIds,
    (resultsData ?? []) as GroupResultInput[]
  )
  const assessed = new Set(assessedMemberIds)
  const members = ((peopleData ?? []) as PersonRow[])
    .map((person) => ({
      id: person.id,
      name: person.name,
      isSelf: person.is_self,
      assessed: assessed.has(person.id),
    }))
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
