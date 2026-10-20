// Credentials are bound to this production RP. Preview deployments cannot use them.
export function canUsePasskeys() {
  return typeof window !== 'undefined' && window.isSecureContext &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    ['continua.info', 'www.continua.info'].includes(window.location.hostname)
}

export function passkeyErrorMessage(error: unknown): string {
  const value = error as { code?: string; name?: string; message?: string; cause?: { name?: string } } | null
  const code = value?.code
  if (code === 'webauthn_credential_exists' || code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED' || value?.name === 'InvalidStateError' || value?.cause?.name === 'InvalidStateError') {
    return 'This passkey is already registered. You can use it to sign in.'
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
