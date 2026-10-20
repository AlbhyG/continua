'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type AssessmentAdminRow = {
  id: number
  name: string
  email: string | null
  linked: boolean
  questionnaireId: number
  takenAt: string
  axes: Array<{ name: string; score: number }>
}

type LinkFilter = 'all' | 'linked' | 'anonymous'
type SortOrder = 'newest' | 'oldest'

export function AssessmentsTable({ rows }: { rows: AssessmentAdminRow[] }) {
  const [linkFilter, setLinkFilter] = useState<LinkFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const visibleRows = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null
    const to = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null

    return rows
      .filter((row) => {
        const takenAt = new Date(row.takenAt).getTime()
        const matchesLink =
          linkFilter === 'all' ||
          (linkFilter === 'linked' ? row.linked : !row.linked)
        return (
          matchesLink &&
          (from === null || takenAt >= from) &&
          (to === null || takenAt <= to)
        )
      })
      .sort((a, b) => {
        const difference = new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
        return sortOrder === 'newest' ? difference : -difference
      })
  }, [fromDate, linkFilter, rows, sortOrder, toDate])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-sm font-medium">
          Account status
          <select
            value={linkFilter}
            onChange={(event) => setLinkFilter(event.target.value as LinkFilter)}
            className="h-10 rounded border border-gray-300 px-3"
          >
            <option value="all">All results</option>
            <option value="linked">Linked accounts</option>
            <option value="anonymous">Anonymous</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          From date
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="h-10 rounded border border-gray-300 px-3"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Through date
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="h-10 rounded border border-gray-300 px-3"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Sort
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="h-10 rounded border border-gray-300 px-3"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      <p className="text-sm text-gray-600">
        Showing {visibleRows.length} of {rows.length} assessments
      </p>

      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">Person</th>
              <th className="border-b border-gray-200 px-4 py-3">Status</th>
              <th className="border-b border-gray-200 px-4 py-3">Questionnaire</th>
              <th className="border-b border-gray-200 px-4 py-3">Axes</th>
              <th className="border-b border-gray-200 px-4 py-3">Taken</th>
              <th className="border-b border-gray-200 px-4 py-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="border-b border-gray-100 px-4 py-3">
                  <p className="font-semibold text-gray-900">{row.name}</p>
                  {row.email && <p className="mt-0.5 text-xs text-gray-500">{row.email}</p>}
                </td>
                <td className="border-b border-gray-100 px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      row.linked
                        ? 'bg-green-50 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {row.linked ? 'Linked' : 'Anonymous'}
                  </span>
                </td>
                <td className="border-b border-gray-100 px-4 py-3">
                  #{row.questionnaireId}
                </td>
                <td className="min-w-[330px] border-b border-gray-100 px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.axes.map((axis) => (
                      <span
                        key={axis.name}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {axis.name}: <strong>{axis.score}</strong>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3">
                  {new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(row.takenAt))}
                </td>
                <td className="border-b border-gray-100 px-4 py-3">
                  <Link
                    href={`/quiz/results/${row.id}`}
                    className="font-semibold text-blue-700 underline underline-offset-2"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No assessments match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
