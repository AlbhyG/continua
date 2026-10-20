import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_CONTACTS_COOKIE = 'continua_admin_contacts'

export function getAdminContactsToken() {
  const password = process.env.ADMIN_CONTACTS_PASSWORD
  if (!password) {
    return null
  }

  return createHash('sha256')
    .update(`continua-admin-contacts:${password}`)
    .digest('hex')
}

export async function hasAdminContactsSession() {
  const token = getAdminContactsToken()
  if (!token) {
    return false
  }

  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_CONTACTS_COOKIE)?.value === token
}
