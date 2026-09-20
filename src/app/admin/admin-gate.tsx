import Link from 'next/link'
import type { AdminStatus } from '@/lib/admin/admin-auth'

// Shared "you can't be here" states for every /admin page, now that access is
// tied to a real signed-in account on the admin_users allowlist instead of a
// shared password. Render this whenever getAdminStatus() didn't return
// 'admin'; returns null for the admin case so callers can do:
//   const status = await getAdminStatus()
//   const gate = <AdminGate status={status} next="/admin/assessments" />
//   if (gate) return gate
export function AdminGate({ status, next }: { status: AdminStatus; next: string }) {
  if (status.status === 'signed_out') {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
        <div className="mx-auto max-w-sm rounded-md border border-gray-200 bg-white p-5 shadow-sm">
          <h1 className="text-lg font-semibold">Sign in required</h1>
          <p className="mt-2 text-sm text-gray-600">
            This page is limited to admin accounts. Sign in with your
            Continua account first.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="mt-4 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
      </main>
    )
  }

  if (status.status === 'not_admin') {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
        <div className="mx-auto max-w-sm rounded-md border border-gray-200 bg-white p-5 shadow-sm">
          <h1 className="text-lg font-semibold">Not an admin account</h1>
          <p className="mt-2 text-sm text-gray-600">
            {status.email ? (
              <>
                You&apos;re signed in as <strong>{status.email}</strong>, but
                this
              </>
            ) : (
              'This'
            )}{' '}
            account isn&apos;t on the admin list. Ask an existing admin to add
            you.
          </p>
          <form action="/auth/signout" method="post" className="mt-4">
            <button
              type="submit"
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    )
  }

  return null
}
