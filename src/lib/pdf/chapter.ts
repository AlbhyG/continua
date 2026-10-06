// Default sample: title page, Preface and Chapter 1 (no table of contents), from the
// October 4, 2026 manuscript. The name keeps the 'first-chapter' prefix so bookLabel()
// still labels it "first chapter" in emails, texts and download links.
// Shared by email/SMS delivery and the legacy email verification flow.
export function chapterStoragePath(): string {
  return process.env.CONTACT_PDF_STORAGE_PATH || 'first-chapter-2026-10-06.pdf'
}
