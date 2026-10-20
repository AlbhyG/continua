import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { hasAdminContactsSession } from '@/lib/admin/contacts-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{ error?: string }>
}

type ContactRow = {
  user_id: string | null
  name: string
  email: string | null
  phone: string | null
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  const hasSession = await hasAdminContactsSession()

  if (!hasSession) {
    return <PasswordGate showError={params.error === '1'} />
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return <AdminError message="SUPABASE_SERVICE_ROLE_KEY is missing." />
  }

  const [usersResponse, contactsResponse] = await Promise.all([
    fetchAllUsers(supabase),
    fetchAllRegisteredContacts(supabase),
  ])

  if (usersResponse.error || contactsResponse.error) {
    return (
      <AdminError
        message={
          usersResponse.error?.message ||
          contactsResponse.error?.message ||
          'Registered users could not be loaded.'
        }
      />
    )
  }

  const contacts = new Map(
    contactsResponse.data
      .filter((contact) => contact.user_id)
      .map((contact) => [contact.user_id as string, contact])
  )
  const rows = usersResponse.data
    .map((user) => {
      const contact = contacts.get(user.id)
      return {
        id: user.id,
        name:
          contact?.name ||
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Unnamed user',
        email: contact?.email || user.email || '',
        phone: contact?.phone || user.phone || '',
        registeredAt: user.created_at,
        lastSignInAt: user.last_sign_in_at || null,
      }
    })
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Registered Users</h1>
            <p className="text-sm text-gray-600">
              Authenticated accounts and their available contact information.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/contacts"
              className="h-9 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
            >
              Contacts
            </Link>
            <Link
              href="/admin/assessments"
              className="h-9 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
            >
              Assessments
            </Link>
            <form action="/admin/contacts/logout" method="post">
              <input type="hidden" name="next" value="/admin/users" />
              <button
                type="submit"
                className="h-9 rounded border border-gray-300 bg-white px-3 text-sm font-semibold"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {rows.length} registered {rows.length === 1 ? 'user' : 'users'}
        </p>

        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2">Name</th>
                <th className="border-b border-gray-200 px-3 py-2">Email</th>
                <th className="border-b border-gray-200 px-3 py-2">Phone</th>
                <th className="border-b border-gray-200 px-3 py-2">Registered</th>
                <th className="border-b border-gray-200 px-3 py-2">Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="border-b border-gray-100 px-3 py-2 font-medium text-gray-900">
                    {row.name}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-2">{row.email}</td>
                  <td className="border-b border-gray-100 px-3 py-2">{row.phone}</td>
                  <td className="whitespace-nowrap border-b border-gray-100 px-3 py-2">
                    {new Date(row.registeredAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap border-b border-gray-100 px-3 py-2">
                    {row.lastSignInAt ? new Date(row.lastSignInAt).toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                    No registered users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

async function fetchAllUsers(supabase: ReturnType<typeof createAdminClient>) {
  if (!supabase) return { data: [] as User[], error: new Error('Admin client unavailable') }

  const users: User[] = []
  let page = 1

  for (;;) {
    const response = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (response.error) return { data: [] as User[], error: response.error }
    users.push(...response.data.users)
    if (!response.data.nextPage) break
    page = response.data.nextPage
  }

  return { data: users, error: null }
}

async function fetchAllRegisteredContacts(supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const data: ContactRow[] = []
  const pageSize = 1000

  for (let from = 0; ; from += pageSize) {
    const response = await supabase
      .from('contacts')
      .select('user_id,name,email,phone')
      .not('user_id', 'is', null)
      .range(from, from + pageSize - 1)

    if (response.error) return { data: [] as ContactRow[], error: response.error }
    const page = (response.data || []) as ContactRow[]
    data.push(...page)
    if (page.length < pageSize) break
  }

  return { data, error: null }
}

function PasswordGate({ showError }: { showError: boolean }) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-sm rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold">Registered User Admin</h1>
        <form action="/admin/contacts/login" method="post" className="mt-4 space-y-3">
          <input type="hidden" name="next" value="/admin/users" />
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input
              type="password"
              name="password"
              className="h-10 rounded border border-gray-300 px-3"
              autoComplete="current-password"
            />
          </label>
          {showError && (
            <p className="text-sm text-red-700" role="alert">
              Invalid password or missing `ADMIN_CONTACTS_PASSWORD`.
            </p>
          )}
          <button
            type="submit"
            className="h-10 rounded bg-gray-900 px-4 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}

function AdminError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900">
      <p className="mx-auto max-w-7xl rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Registered user admin is unavailable: {message}
      </p>
    </main>
  )
}
