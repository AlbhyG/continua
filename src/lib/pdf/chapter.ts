// Shared by email/SMS delivery and the legacy email verification flow.
export function chapterStoragePath(): string {
  return process.env.CONTACT_PDF_STORAGE_PATH || 'first-chapter-2026-08-30.pdf'
}
