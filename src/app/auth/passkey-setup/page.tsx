import type { Metadata } from 'next'
import { requireUser, safeNextPath } from '@/lib/auth/current-user'
import PasskeySetup from './passkey-setup'

export const metadata: Metadata = { title: 'Set up a passkey' }

export default async function PasskeySetupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const nextPath = safeNextPath((await searchParams).next ?? null)
  await requireUser(nextPath)
  const destination = /^\/auth(?:\/|\?|#|$)/.test(nextPath) || /^\/login(?:\?|#|$)/.test(nextPath) ? '/my-info' : nextPath
  return <PasskeySetup nextPath={destination} />
}
