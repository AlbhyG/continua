import type { BrowserContext } from '@playwright/test'

// Exercise a local production build at the real RP origins without changing the
// live RP configuration. Only Continua page traffic is routed; Supabase remains real.
export async function routeLocalAuthBuild(context: BrowserContext) {
  const local = process.env.CONTINUA_LOCAL_AUTH_SERVER
  if (!local) return
  await context.route(/^https:\/\/(www\.)?continua\.info\//, async (route) => {
    const original = new URL(route.request().url())
    const response = await route.fetch({
      url: local + original.pathname + original.search,
      headers: { ...route.request().headers(), host: original.host, 'x-forwarded-host': original.host, 'x-forwarded-proto': 'https' },
      maxRedirects: 0,
    })
    const headers = response.headers()
    if (headers.location) {
      const location = new URL(headers.location, original)
      if (['localhost', '127.0.0.1', 'continua.info', 'www.continua.info'].includes(location.hostname)) {
        headers.location = original.origin + location.pathname + location.search + location.hash
      }
      // Playwright routes only the first URL of an HTTP redirect chain. Turn a
      // local-build redirect into a new navigation, so it cannot escape to the
      // currently deployed app (whose chunk hashes differ from the local build).
      const destination = headers.location
      delete headers.location
      delete headers['content-length']
      delete headers['content-encoding']
      await route.fulfill({ status: 200, headers: { ...headers, 'content-type': 'text/html' }, body: `<script>location.replace(${JSON.stringify(destination).replace(/</g, '\\u003c')})</script>` })
      return
    }
    await route.fulfill({ response, headers })
  })
}
