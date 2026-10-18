// What this browser remembers about signing in. Passkeys belong to a device
// (or its password manager), not to the account, so the sign-in page and the
// passkey offer need to know about *this* browser. Kept in localStorage; it
// can be missing or blocked (private windows), so every call is best-effort
// and the absence of a value just means "assume this is a new device".

const HAS_PASSKEY = 'continua.passkeyOnThisDevice'
const SNOOZE_UNTIL = 'continua.passkeyOfferSnoozedUntil'
const SNOOZE_DAYS = 30

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Storage unavailable: nothing to remember, nothing breaks.
  }
}

export function deviceHasPasskey(): boolean {
  return read(HAS_PASSKEY) === '1'
}

export function rememberPasskeyOnDevice() {
  write(HAS_PASSKEY, '1')
  write(SNOOZE_UNTIL, null)
}

export function forgetPasskeyOnDevice() {
  write(HAS_PASSKEY, null)
}

export function passkeyOfferSnoozed(): boolean {
  const until = Number(read(SNOOZE_UNTIL))
  return Number.isFinite(until) && until > Date.now()
}

export function snoozePasskeyOffer() {
  write(SNOOZE_UNTIL, String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000))
}
