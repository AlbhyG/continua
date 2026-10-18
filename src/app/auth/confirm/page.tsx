import type { Metadata } from 'next'
import Link from 'next/link'
import { safeNextPath } from '@/lib/auth/current-user'

export const metadata: Metadata = {
  title: 'Finish signing in',
  robots: { index: false, follow: false },
  // The token is in this page's address; don't pass it on to anything the page loads.
  referrer: 'no-referrer',
}

// Landing page for the emailed sign-in link. Opening it does nothing on its
// own (so email link scanners can't use up the link); the button does the
// sign-in by posting the token to /auth/callback.
export default async function ConfirmSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; next?: string }>
}) {
  const params = await searchParams
  const tokenHash = params.token_hash ?? ''
  const nextPath = safeNextPath(params.next ?? null)

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-6 py-20">
      <section className="glass-card w-full p-7 md:p-9">
        {tokenHash ? (
          <>
            <h1 className="text-3xl font-bold text-foreground">Finish signing in</h1>
            <p className="mt-3 text-foreground/70">
              One more tap and you&rsquo;re in.
            </p>
            <form method="post" action="/auth/callback" className="mt-7">
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="next" value={nextPath} />
              <button
                type="submit"
                autoFocus
                className="w-full rounded-xl bg-foreground px-5 py-3 font-bold text-white hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Finish signing in
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground">This link is incomplete</h1>
            <p className="mt-3 text-foreground/70">
              Please request a new sign-in link.
            </p>
            <Link
              href="/login"
              className="mt-7 block w-full rounded-xl bg-foreground px-5 py-3 text-center font-bold text-white hover:bg-foreground/85"
            >
              Go to sign in
            </Link>
          </>
        )}
      </section>
    </main>
  )
}
