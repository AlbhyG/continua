import crypto from 'crypto'

// Short, URL-safe, unguessable token for a one-off book link (~11 chars).
export function generatePdfLinkToken(): string {
  return crypto.randomBytes(8).toString('base64url')
}

// Password used to open the delivered PDF.
// - With an email on file: the lowercase email address.
// - Phone-only: the phone number, digits only, with a leading country-code 1
//   removed (e.g. "+1 (310) 980-2841" -> "3109802841").
export function derivePdfPassword(
  email: string | null,
  phone: string | null
): string {
  if (email && email.trim()) {
    return email.trim().toLowerCase()
  }
  return (phone || '').replace(/\D/g, '').replace(/^1/, '')
}

export function bookLabel(filePath: string): string {
  return filePath.replace(/\.pdf$/i, '')
}
