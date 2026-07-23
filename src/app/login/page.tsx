import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth/current-user'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to save assessments and manage your Continua relationships.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const nextPath = safeNextPath(params.next ?? null)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(nextPath)
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-6 py-20">
      <section className="glass-card w-full p-7 md:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Your Continua
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Sign in or create an account
        </h1>
        <p className="mt-3 text-foreground/70">
          Enter your email and we’ll send you a secure sign-in link. No password
          to remember.
        </p>
        <LoginForm
          nextPath={nextPath}
          initialError={
            params.error
              ? 'That sign-in link could not be completed. Please request a new one.'
              : null
          }
        />
      </section>
    </main>
  )
}
