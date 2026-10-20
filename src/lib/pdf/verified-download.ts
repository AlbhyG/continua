import { bookLabel, derivePdfPassword, generatePdfLinkToken } from './links'

export async function verifiedDownload(
  result: unknown,
  filePath: string,
  saveLink: (link: { token: string; file_path: string; user_password: string; label: string }) => Promise<void>
): Promise<{ success?: boolean; error?: string; downloadUrl?: string; password?: string }> {
  const value = result as { status?: string; email?: string } | null
  if (value?.status !== 'verified' || typeof value.email !== 'string' || !value.email.trim()) {
    return { error: value?.status === 'expired'
      ? 'This verification link has expired. Please request the first chapter again from the homepage.'
      : 'This verification link is invalid or has already been used. Please request the first chapter again from the homepage.' }
  }
  const token = generatePdfLinkToken()
  const password = derivePdfPassword(value.email, null)
  try {
    await saveLink({ token, file_path: filePath, user_password: password, label: bookLabel(filePath) })
    return { success: true, downloadUrl: `/d/${token}`, password }
  } catch {
    return { error: 'Your email was verified, but the download could not be prepared. Please request the first chapter from the homepage for email delivery.' }
  }
}
