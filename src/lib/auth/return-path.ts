const SITE_ORIGINS = ['https://continua.info', 'https://www.continua.info']

export function safeNextPath(value: string | null, fallback = '/') {
  if (!value || /[\\\x00-\x1f\x7f]/.test(value)) return fallback
  try {
    const url = new URL(value, SITE_ORIGINS[0])
    if (!SITE_ORIGINS.includes(url.origin) || (!value.startsWith('/') && !value.startsWith('https://'))) return fallback
    if (value.startsWith('//') || url.pathname.startsWith('//')) return fallback
    if (/^\/(?:login|auth)(?:\/|$)/.test(url.pathname)) return fallback
    return url.pathname + url.search + url.hash
  } catch { return fallback }
}

// Email templates carry the allowlisted callback URL in the token link. Its
// destination travels with the email, even when opened in a fresh browser.
export function emailReturnPath(value: string | null) {
  if (!value) return '/'
  try {
    const callback = new URL(value)
    if (!SITE_ORIGINS.includes(callback.origin) || callback.pathname !== '/auth/callback') return '/'
    return safeNextPath(callback.searchParams.get('next'))
  } catch { return '/' }
}
