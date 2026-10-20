'use client'

import { useMemo, useState } from 'react'

export type ContactAdminRow = {
  rowId: string
  contactId: number
  name: string
  email: string | null
  phone: string | null
  roles: string[]
  status: string
  filesSent: string[]
  sentOrCreatedAt: string | null
  error: string | null
  resendEmailId: string | null
}

function csvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

export function ContactsTable({ rows }: { rows: ContactAdminRow[] }) {
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [notice, setNotice] = useState<string | null>(null)

  const roles = useMemo(
    () => Array.from(new Set(rows.flatMap((row) => row.roles))).sort(),
    [rows]
  )
  const statuses = useMemo(
    () => Array.from(new Set(rows.map((row) => row.status))).sort(),
    [rows]
  )

  const visibleRows = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesRole = !role || row.roles.includes(role)
      const matchesStatus = !status || row.status === status
      const haystack = [row.name, row.email, row.phone].filter(Boolean).join(' ').toLowerCase()
      const matchesQuery = !cleanQuery || haystack.includes(cleanQuery)
      return matchesRole && matchesStatus && matchesQuery
    })
  }, [query, role, rows, status])

  const visibleEmails = visibleRows
    .map((row) => row.email)
    .filter((email): email is string => Boolean(email))
  const selectedEmails = visibleRows
    .filter((row) => selected.has(row.rowId))
    .map((row) => row.email)
    .filter((email): email is string => Boolean(email))

  const copyEmails = async (emails: string[], label: string) => {
    const uniqueEmails = Array.from(new Set(emails))
    if (uniqueEmails.length === 0) {
      setNotice(`No ${label} emails to copy.`)
      return
    }
    await navigator.clipboard.writeText(uniqueEmails.join(', '))
    setNotice(`Copied ${uniqueEmails.length} ${label} email${uniqueEmails.length === 1 ? '' : 's'}.`)
  }

  const exportCsv = () => {
    const headers = [
      'name',
      'email',
      'phone',
      'roles',
      'delivery_status',
      'files_sent',
      'sent_or_created_time',
      'resend_email_id',
      'error',
    ]
    const body = visibleRows.map((row) =>
      [
        row.name,
        row.email || '',
        row.phone || '',
        row.roles.join('; '),
        row.status,
        row.filesSent.join('; '),
        row.sentOrCreatedAt || '',
        row.resendEmailId || '',
        row.error || '',
      ]
        .map(csvValue)
        .join(',')
    )
    const csv = [headers.join(','), ...body].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `continua-contacts-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const toggleSelected = (rowId: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-3">
        <label className="grid gap-1 text-xs font-semibold text-gray-700">
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 w-64 rounded border border-gray-300 px-2 text-sm font-normal"
            placeholder="name, email, phone"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-gray-700">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-9 rounded border border-gray-300 px-2 text-sm font-normal"
          >
            <option value="">All roles</option>
            {roles.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-gray-700">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-9 rounded border border-gray-300 px-2 text-sm font-normal"
          >
            <option value="">All statuses</option>
            {statuses.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => copyEmails(visibleEmails, 'visible')}
          className="h-9 rounded bg-gray-900 px-3 text-sm font-semibold text-white"
        >
          Copy visible BCC
        </button>
        <button
          type="button"
          onClick={() => copyEmails(selectedEmails, 'selected')}
          className="h-9 rounded border border-gray-300 px-3 text-sm font-semibold text-gray-800"
        >
          Copy selected BCC
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="h-9 rounded border border-gray-300 px-3 text-sm font-semibold text-gray-800"
        >
          Export CSV
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {visibleRows.length} of {rows.length} rows
        </span>
        {notice && <span role="status">{notice}</span>}
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="w-10 border-b border-gray-200 px-3 py-2">Sel</th>
              <th className="border-b border-gray-200 px-3 py-2">Name</th>
              <th className="border-b border-gray-200 px-3 py-2">Email</th>
              <th className="border-b border-gray-200 px-3 py-2">Phone</th>
              <th className="border-b border-gray-200 px-3 py-2">Roles</th>
              <th className="border-b border-gray-200 px-3 py-2">Status</th>
              <th className="border-b border-gray-200 px-3 py-2">Files</th>
              <th className="border-b border-gray-200 px-3 py-2">Time</th>
              <th className="border-b border-gray-200 px-3 py-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.rowId} className="align-top">
                <td className="border-b border-gray-100 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(row.rowId)}
                    onChange={() => toggleSelected(row.rowId)}
                    aria-label={`Select ${row.name}`}
                  />
                </td>
                <td className="border-b border-gray-100 px-3 py-2 font-medium text-gray-900">
                  {row.name}
                </td>
                <td className="border-b border-gray-100 px-3 py-2">{row.email || ''}</td>
                <td className="border-b border-gray-100 px-3 py-2">{row.phone || ''}</td>
                <td className="border-b border-gray-100 px-3 py-2">{row.roles.join(', ')}</td>
                <td className="border-b border-gray-100 px-3 py-2">{row.status}</td>
                <td className="border-b border-gray-100 px-3 py-2">{row.filesSent.join(', ')}</td>
                <td className="whitespace-nowrap border-b border-gray-100 px-3 py-2">
                  {row.sentOrCreatedAt
                    ? new Date(row.sentOrCreatedAt).toLocaleString()
                    : ''}
                </td>
                <td className="max-w-[320px] border-b border-gray-100 px-3 py-2 text-red-700">
                  {row.error || ''}
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                  No contacts match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
