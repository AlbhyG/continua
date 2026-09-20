import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { getAdminStatus } from '@/lib/admin/admin-auth'
import { AdminGate } from '../admin-gate'
import { AXIS_INFO, type AxisScores } from '@/lib/quiz/scoring'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  AssessmentsTable,
  type AssessmentAdminRow,
} from './assessments-table'

export const dynamic = 'force-dynamic'

type QuizResultRow = {
  id: number
  user_id: string | null
  person_id: string | null
  questionnaire_id: number
  score: number
  scores: Partial<AxisScores> | null
  taken_at: string
}

type ContactRow = {
  user_id: string | null
  name: string
  email: string | null
}

type PersonRow = {
  id: string
  name: string
  email: string | null
}

const AXES = Object.keys(AXIS_INFO) as Array<keyof AxisScores>

export default async function AdminAssessmentsPage() {
  const adminStatus = await getAdminStatus()
  const gate = <AdminGate status={adminStatus} next="/admin/assessments" />
  if (gate) return gate

  const supabase = createAdminClient()
  if (!supabase) {
    return <AdminError message="SUPABASE_SERVICE_ROLE_KEY is missing." />
  }

  const resultsResponse = await fetchAllQuizResults(supabase)
  if (resultsResponse.error) {
    return <DataError error={resultsResponse.error} />
  }

  const resultRows = resultsResponse.data
  const userIds = Array.from(
    new Set(resultRows.flatMap((result) => (result.user_id ? [result.user_id] : [])))
  )
  const personIds = Array.from(
    new Set(resultRows.flatMap((result) => (result.person_id ? [result.person_id] : [])))
  )

  const [contactsResult, peopleResult] = await Promise.all([
    userIds.length
      ? supabase
          .from('contacts')
          .select('user_id,name,email')
          .in('user_id', userIds)
      : Promise.resolve({ data: [], error: null }),
    personIds.length
      ? supabase
          .from('people')
          .select('id,name,email')
          .in('id', personIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (contactsResult.error || peopleResult.error) {
    return <DataError error={contactsResult.error || peopleResult.error} />
  }

  const contacts = new Map(
    ((contactsResult.data ?? []) as ContactRow[])
      .filter((contact) => contact.user_id)
      .map((contact) => [contact.user_id as string, contact])
  )
  const people = new Map(
    ((peopleResult.data ?? []) as PersonRow[]).map((person) => [person.id, person])
  )
  const rows: AssessmentAdminRow[] = resultRows.map((result) => {
    const contact = result.user_id ? contacts.get(result.user_id) : null
    const person = result.person_id ? people.get(result.person_id) : null
    const scores = result.scores ?? { empathy: result.score }

    return {
      id: result.id,
      name: person?.name || contact?.name || 'Anonymous',
      email: person?.email || contact?.email || null,
      linked: Boolean(result.user_id),
      questionnaireId: result.questionnaire_id,
      takenAt: result.taken_at,
      axes: AXES.filter((axis) => Number.isFinite(scores[axis])).map((axis) => ({
        name: AXIS_INFO[axis].name,
        score: Number(scores[axis]),
      })),
    }
  })

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Assessment Activity</h1>
            <p className="text-sm text-gray-600">
              Every saved assessment, including linked and anonymous attempts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="h-9 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
            >
              Users
            </Link>
            <Link
              href="/admin/contacts"
              className="h-9 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
            >
              Contacts
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="h-9 rounded border border-gray-300 bg-white px-3 text-sm font-semibold"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <AssessmentsTable rows={rows} />
      </div>
    </main>
  )
}

async function fetchAllQuizResults(supabase: SupabaseClient) {
  const pageSize = 1000
  const data: QuizResultRow[] = []

  for (let from = 0; ; from += pageSize) {
    const response = await supabase
      .from('quiz_results')
      .select('id,user_id,person_id,questionnaire_id,score,scores,taken_at')
      .order('taken_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (response.error) {
      return { data: [], error: response.error }
    }

    const page = (response.data ?? []) as QuizResultRow[]
    data.push(...page)
    if (page.length < pageSize) break
  }

  return { data, error: null }
}

function AdminError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900">
      <p className="mx-auto max-w-7xl rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Assessment admin is unavailable: {message}
      </p>
    </main>
  )
}

function DataError({ error }: { error: PostgrestError | null }) {
  return (
    <AdminError message={error?.message || 'Assessment data could not be loaded.'} />
  )
}
