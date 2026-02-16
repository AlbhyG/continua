import { isValidTokenFormat } from '@/lib/tokens/generate'
import VerificationForm from './verification-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Email — Continua',
  description: 'Confirm your email address to download your Book.',
}

interface VerifyPageProps {
  params: Promise<{ token: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { token } = await params

  // Validate token format (does NOT consume the token)
  if (!isValidTokenFormat(token)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background/95 to-accent/5">
        <div className="max-w-md w-full rounded-2xl bg-white/95 backdrop-blur shadow-lg p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Link</h1>
          <p className="text-gray-600">
            This verification link is not valid. Please check the link in your email or request a new Book download.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background/95 to-accent/5">
      <VerificationForm token={token} />
    </div>
  )
}
