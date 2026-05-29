import type { PostgrestError } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { hasAdminContactsSession } from '@/lib/admin/contacts-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { ContactsTable, type ContactAdminRow } from './contacts-table'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{ error?: string }>
}

type DeliveryLogRow = {
  delivery_id: number
  contact_id: number
  name: string
  email: string | null
  phone: string | null
  roles: string[] | null
  status: string
  files_sent: string[] | null
  sent_at: string | null
  created_at: string | null
  error: string | null
  resend_email_id?: string | null
}

type ContactRow = {
  id: number
  name: string
  email: string | null
  phone: string | null
  interest_roles: string[] | null
  signed_up_at: string | null
  created_at: string | null
}

export default async function AdminContactsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  const hasSession = await hasAdminContactsSession()

  if (!hasSession) {
    return <PasswordGate showError={params.error === '1'} />
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return (
      <AdminShell>
        <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Admin contacts are configured in code, but `SUPABASE_SERVICE_ROLE_KEY`
          is missing. Add it server-side in Vercel and local env to read contact rows.
        </p>
      </AdminShell>
    )
  }

  const [deliveryResult, contactsResult] = await Promise.all([
    supabase
      .from('contact_delivery_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('contacts')
      .select('id,name,email,phone,interest_roles,signed_up_at,created_at')
      .order('created_at', { ascending: false })
      .limit(1000),
  ])

  if (deliveryResult.error || contactsResult.error) {
    return (
      <AdminShell>
        <DataError error={deliveryResult.error || contactsResult.error} />
      </AdminShell>
    )
  }

  const rows = buildRows(
    (deliveryResult.data || []) as DeliveryLogRow[],
    (contactsResult.data || []) as ContactRow[]
  )

  return (
    <AdminShell>
      <ContactsTable rows={rows} />
    </AdminShell>
  )
}

function PasswordGate({ showError }: { showError: boolean }) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-sm rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold">Contact Admin</h1>
        <form action="/admin/contacts/login" method="post" className="mt-4 space-y-3">
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

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Contact Delivery Admin</h1>
            <p className="text-sm text-gray-600">
              Registration lookup, BCC copy, and CSV export.
            </p>
          </div>
          <form action="/admin/contacts/logout" method="post">
            <button
              type="submit"
              className="h-9 rounded border border-gray-300 bg-white px-3 text-sm font-semibold"
            >
              Sign out
            </button>
          </form>
        </div>
        {children}
      </div>
    </main>
  )
}

function DataError({ error }: { error: PostgrestError | null }) {
  return (
    <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      Contact data could not be loaded: {error?.message || 'Unknown error'}
    </p>
  )
}

function buildRows(deliveries: DeliveryLogRow[], contacts: ContactRow[]): ContactAdminRow[] {
  const contactsWithDelivery = new Set(deliveries.map((delivery) => delivery.contact_id))
  const deliveryRows = deliveries.map((delivery) => ({
    rowId: `delivery-${delivery.delivery_id}`,
    contactId: delivery.contact_id,
    name: delivery.name,
    email: delivery.email,
    phone: delivery.phone,
    roles: delivery.roles || [],
    status: delivery.status,
    filesSent: delivery.files_sent || [],
    sentOrCreatedAt: delivery.sent_at || delivery.created_at,
    error: delivery.error,
    resendEmailId: delivery.resend_email_id || null,
  }))

  const contactOnlyRows = contacts
    .filter((contact) => !contactsWithDelivery.has(contact.id))
    .map((contact) => ({
      rowId: `contact-${contact.id}`,
      contactId: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      roles: contact.interest_roles || [],
      status: 'no_delivery',
      filesSent: [],
      sentOrCreatedAt: contact.signed_up_at || contact.created_at,
      error: null,
      resendEmailId: null,
    }))

  return [...deliveryRows, ...contactOnlyRows]
}
