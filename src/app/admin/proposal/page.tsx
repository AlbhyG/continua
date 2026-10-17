import Link from 'next/link'
import { hasAdminContactsSession } from '@/lib/admin/contacts-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { PROPOSAL_FILE_PATH, PROPOSAL_LABEL } from '@/lib/pdf/proposal'
import { createProposalLink, setProposalLinkRevoked } from './actions'
import CopyButton from './copy-button'

export const dynamic = 'force-dynamic'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://continua.info'

type LinkRow = {
  token: string
  recipient: string | null
  note: string | null
  revoked_at: string | null
  created_at: string
}

type OpenRow = { token: string; opened_at: string }

const UPLOAD_MESSAGES: Record<string, string> = {
  ok: 'Proposal uploaded. Every link now serves the new version.',
  missing: 'Choose a PDF file to upload.',
  type: 'That file is not a PDF.',
  auth: 'Your admin session expired. Sign in again.',
  config: 'SUPABASE_SERVICE_ROLE_KEY is missing.',
  error: 'Upload failed. If the file is larger than about 4 MB, compress it and try again.',
}

function when(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  }).format(new Date(value))
}

export default async function AdminProposalPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; upload?: string }>
}) {
  const params = searchParams ? await searchParams : {}
  if (!(await hasAdminContactsSession())) {
    return <PasswordGate showError={params.error === '1'} />
  }

  const supabase = createAdminClient()
  if (!supabase) return <Notice text="SUPABASE_SERVICE_ROLE_KEY is missing." />

  const [linksResponse, fileResponse] = await Promise.all([
    supabase
      .from('pdf_links')
      .select('token, recipient, note, revoked_at, created_at')
      .eq('label', PROPOSAL_LABEL)
      .order('created_at', { ascending: false }),
    supabase.storage.from('books').list('', { search: PROPOSAL_FILE_PATH }),
  ])

  if (linksResponse.error) {
    return (
      <Notice
        text={`The proposal tables are not set up yet. Run supabase/migrations/00022_proposal_links.sql in the Supabase SQL editor, then reload. (${linksResponse.error.message})`}
      />
    )
  }

  const links = (linksResponse.data ?? []) as LinkRow[]
  const file = (fileResponse.data ?? []).find((f) => f.name === PROPOSAL_FILE_PATH)

  const opensByToken = new Map<string, string[]>()
  if (links.length > 0) {
    const { data: opens } = await supabase
      .from('pdf_link_opens')
      .select('token, opened_at')
      .in('token', links.map((l) => l.token))
      .order('opened_at', { ascending: true })
    for (const open of (opens ?? []) as OpenRow[]) {
      const list = opensByToken.get(open.token) ?? []
      list.push(open.opened_at)
      opensByToken.set(open.token, list)
    }
  }

  const uploadMessage = params.upload ? UPLOAD_MESSAGES[params.upload] : null

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Book Proposal Links</h1>
            <p className="text-sm text-gray-600">
              Make a private link for each person you send the proposal to, and see when they open it.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[
              ['/admin/contacts', 'Contacts'],
              ['/admin/assessments', 'Assessments'],
              ['/admin/users', 'Users'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="h-9 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold">
                {label}
              </Link>
            ))}
            <form action="/admin/contacts/logout" method="post">
              <input type="hidden" name="next" value="/admin/proposal" />
              <button type="submit" className="h-9 rounded border border-gray-300 bg-white px-3 text-sm font-semibold">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Proposal file</h2>
          <p className="mt-1 text-sm text-gray-600">
            {file
              ? `Current version uploaded ${file.updated_at || file.created_at ? when((file.updated_at || file.created_at) as string) : 'earlier'}${file.metadata?.size ? ` · ${(Number(file.metadata.size) / 1024 / 1024).toFixed(1)} MB` : ''}.`
              : 'No proposal uploaded yet. Links will show “not found” until you upload one.'}
          </p>
          <form action="/admin/proposal/upload" method="post" encType="multipart/form-data" className="mt-3 flex flex-wrap items-center gap-3">
            <input type="file" name="file" accept="application/pdf,.pdf" required className="text-sm" />
            <button type="submit" className="h-9 rounded bg-gray-900 px-4 text-sm font-semibold text-white">
              {file ? 'Replace proposal' : 'Upload proposal'}
            </button>
          </form>
          {uploadMessage && <p className="mt-2 text-sm text-gray-700" role="status">{uploadMessage}</p>}
        </section>

        <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">New link</h2>
          <form action={createProposalLink} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="grid gap-1 text-sm font-medium">
              For
              <input name="recipient" required maxLength={200} placeholder="e.g. Jane Smith, Example Literary" className="h-9 rounded border border-gray-300 px-2" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Note (optional)
              <input name="note" maxLength={500} placeholder="e.g. sent via LinkedIn" className="h-9 rounded border border-gray-300 px-2" />
            </label>
            <button type="submit" className="h-9 rounded bg-gray-900 px-4 text-sm font-semibold text-white">
              Create link
            </button>
          </form>
        </section>

        <section className="rounded-md border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2 font-semibold">For</th>
                <th className="px-4 py-2 font-semibold">Link</th>
                <th className="px-4 py-2 font-semibold">Opens</th>
                <th className="px-4 py-2 font-semibold">First / last opened</th>
                <th className="px-4 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-gray-500">No links yet.</td></tr>
              )}
              {links.map((link) => {
                const url = `${SITE_URL}/d/${link.token}`
                const opens = opensByToken.get(link.token) ?? []
                return (
                  <tr key={link.token} className={`border-t border-gray-100 align-top ${link.revoked_at ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{link.recipient || '—'}</p>
                      {link.note && <p className="text-xs text-gray-500">{link.note}</p>}
                      <p className="text-xs text-gray-400">Created {when(link.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="break-all font-mono text-xs">{url}</p>
                      {!link.revoked_at && <div className="mt-1"><CopyButton text={url} /></div>}
                    </td>
                    <td className="px-4 py-3 font-semibold">{opens.length}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {opens.length === 0 ? 'Not opened yet' : (
                        <>
                          {when(opens[0])}
                          {opens.length > 1 && <><br />{when(opens[opens.length - 1])}</>}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <form action={setProposalLinkRevoked}>
                        <input type="hidden" name="token" value={link.token} />
                        <input type="hidden" name="revoke" value={link.revoked_at ? '0' : '1'} />
                        <button type="submit" className="text-xs underline">
                          {link.revoked_at ? 'Turn back on' : 'Turn off'}
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <p className="text-xs text-gray-500">
          An open is counted each time the link is loaded, including by you, so test with a link made for yourself.
          Some email systems preview links automatically, which can also register an open.
        </p>
      </div>
    </main>
  )
}

function Notice({ text }: { text: string }) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900">
      <p className="mx-auto max-w-5xl rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{text}</p>
    </main>
  )
}

function PasswordGate({ showError }: { showError: boolean }) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-sm rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold">Proposal Admin</h1>
        <form action="/admin/contacts/login" method="post" className="mt-4 space-y-3">
          <input type="hidden" name="next" value="/admin/proposal" />
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input type="password" name="password" className="h-10 rounded border border-gray-300 px-3" autoComplete="current-password" />
          </label>
          {showError && (
            <p className="text-sm text-red-700" role="alert">Invalid password or missing `ADMIN_CONTACTS_PASSWORD`.</p>
          )}
          <button type="submit" className="h-10 rounded bg-gray-900 px-4 text-sm font-semibold text-white">Sign in</button>
        </form>
      </div>
    </main>
  )
}
