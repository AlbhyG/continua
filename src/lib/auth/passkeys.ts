// Credentials are bound to this production RP. Preview deployments cannot use them.
export function canUsePasskeys() {
  return typeof window !== 'undefined' && window.isSecureContext &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    ['continua.info', 'www.continua.info'].includes(window.location.hostname)
}

export function isAlreadyRegisteredError(error: unknown): boolean {
  const value = error as { code?: string; name?: string; cause?: { name?: string } } | null
  return value?.code === 'webauthn_credential_exists' || value?.code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED' ||
    value?.name === 'InvalidStateError' || value?.cause?.name === 'InvalidStateError'
}

// Sign-in specific: the system prompt was dismissed or found nothing. On a
// device with no Continua passkey this is what "nothing happened" looks like.
export function passkeySignInErrorMessage(error: unknown): string {
  const value = error as { name?: string; message?: string; cause?: { name?: string }; code?: string } | null
  if (value?.name === 'NotAllowedError' || value?.name === 'AbortError' ||
      value?.cause?.name === 'NotAllowedError' || /cancel|timed out|not allowed|abort/i.test(value?.message ?? '')) {
    return 'No passkey was used. If this device doesn’t have a Continua passkey yet, sign in with your email below; you can add a passkey for this device right after.'
  }
  return passkeyErrorMessage(error)
}

export function passkeyErrorMessage(error: unknown): string {
  const value = error as { code?: string; name?: string; message?: string; cause?: { name?: string } } | null
  const code = value?.code
  if (code === 'webauthn_credential_exists' || code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED' || value?.name === 'InvalidStateError' || value?.cause?.name === 'InvalidStateError') {
    return 'This device or password manager already has a Continua passkey, so there’s nothing to add here. You can use it to sign in. To add another device, sign in on that device and add one there.'
  }
  if (code === 'passkey_disabled') return 'Passkeys are temporarily unavailable. Please use an email sign-in link.'
  if (code === 'too_many_passkeys') return 'You have reached the passkey limit. Remove an unused passkey before adding another.'
  if (code === 'webauthn_credential_not_found') return 'This passkey is no longer registered. Sign in by email to add a new one.'
  if (value?.name === 'NotAllowedError' || value?.name === 'AbortError' ||
      value?.cause?.name === 'NotAllowedError' || /cancel|timed out|not allowed|abort/i.test(value?.message ?? '')) {
    return 'The passkey request was cancelled or timed out. Try again or sign in by email.'
  }
  return 'We couldn’t complete the passkey request. Try again or use an email sign-in link.'
}
