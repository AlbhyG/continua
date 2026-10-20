import type { Metadata } from 'next'
import { Suspense } from 'react'
import RelationshipManager, {
  type RelationshipGroup,
  type RelationshipPerson,
} from './relationship-manager'
import { requireUser } from '@/lib/auth/current-user'

export const metadata: Metadata = {
  title: 'My Relationships',
  description: 'Create people and groups and explore their combined Continua profiles.',
}

type PersonRow = {
  id: string
  name: string
  email: string | null
  is_self: boolean
}

type GroupRow = {
  id: string
  name: string
  kind: string
}

type ResultRow = {
  id: number
  person_id: string
  score: number
  taken_at: string
}

export default async function MyRelationshipsPage() {
  const { supabase, user } = await requireUser('/my-relationships')
  const [{ data: peopleData }, { data: groupsData }] = await Promise.all([
    supabase
      .from('people')
      .select('id,name,email,is_self')
      .eq('owner_user_id', user.id)
      .order('is_self', { ascending: false })
      .order('name'),
    supabase
      .from('groups')
      .select('id,name,kind')
      .eq('owner_user_id', user.id)
      .order('created_at'),
  ])

  const personRows = (peopleData ?? []) as PersonRow[]
  const groupRows = (groupsData ?? []) as GroupRow[]
  const personIds = personRows.map((person) => person.id)
  const groupIds = groupRows.map((group) => group.id)

  const [{ data: resultData }, { data: memberData }] = await Promise.all([
    personIds.length
      ? supabase
          .from('quiz_results')
          .select('id,person_id,score,taken_at')
          .in('person_id', personIds)
          .order('taken_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    groupIds.length
      ? supabase
          .from('group_members')
          .select('group_id')
          .in('group_id', groupIds)
      : Promise.resolve({ data: [] }),
  ])

  const latestByPerson = new Map<string, ResultRow>()
  for (const result of (resultData ?? []) as ResultRow[]) {
    if (!latestByPerson.has(result.person_id)) {
      latestByPerson.set(result.person_id, result)
    }
  }

  const countByGroup = new Map<string, number>()
  for (const member of memberData ?? []) {
    countByGroup.set(member.group_id, (countByGroup.get(member.group_id) ?? 0) + 1)
  }

  const people: RelationshipPerson[] = personRows.map((person) => {
    const latest = latestByPerson.get(person.id)
    return {
      id: person.id,
      name: person.name,
      email: person.email,
      isSelf: person.is_self,
      latestResult: latest
        ? { id: latest.id, score: latest.score, takenAt: latest.taken_at }
        : null,
    }
  })

  const groups: RelationshipGroup[] = groupRows.map((group) => ({
    id: group.id,
    name: group.name,
    kind: group.kind,
    memberCount: countByGroup.get(group.id) ?? 0,
  }))

  return (
    <main className="mx-auto max-w-[960px] px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
        Your Continua
      </p>
      <h1 className="mt-2 text-4xl font-bold text-white md:text-5xl">
        My Relationships
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-white/80">
        Add the people who matter to you, organize them into groups, and compare
        the personality patterns that shape your relationships.
      </p>
      <div className="mt-7">
        <Suspense fallback={null}>
          <RelationshipManager people={people} groups={groups} />
        </Suspense>
      </div>
    </main>
  )
}
