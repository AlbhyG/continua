import type { SupabaseClient } from '@supabase/supabase-js'

function decode(value: string): ArrayBuffer {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer
}

function encode(value: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(value)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// The SDK's one-call helper uses modal mediation. Use its public two-step API
// for quiet email-field autofill, without probing whether an email has an account.
export async function signInWithPasskeyAutofill(client: SupabaseClient, signal: AbortSignal) {
  signal.throwIfAborted()
  // The SDK challenge fetch does not accept a signal. Stop waiting immediately
  // when email is chosen; its eventual response must not open a ceremony.
  let abort: () => void = () => {}
  const cancelled = new Promise<never>((_, reject) => {
    abort = () => reject(new DOMException('Aborted', 'AbortError'))
    signal.addEventListener('abort', abort, { once: true })
  })
  const { data, error } = await Promise.race([client.auth.passkey.startAuthentication(), cancelled])
    .finally(() => signal.removeEventListener('abort', abort))
  if (error) throw error
  if (!data) throw new Error('Missing passkey challenge')
  signal.throwIfAborted()
  const options = data.options
  const credential = await navigator.credentials.get({
    mediation: 'conditional', signal,
    publicKey: {
      ...options,
      challenge: decode(options.challenge),
      allowCredentials: options.allowCredentials?.map((item) => ({
        ...item, id: decode(item.id), transports: item.transports as AuthenticatorTransport[] | undefined,
      })),
    },
  }) as PublicKeyCredential | null
  signal.throwIfAborted()
  if (!credential) throw new Error('No saved passkey was selected')
  const response = credential.response as AuthenticatorAssertionResponse
  return client.auth.passkey.verifyAuthentication({
    challengeId: data.challenge_id,
    credential: {
      id: credential.id, rawId: encode(credential.rawId), type: 'public-key',
      authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
      clientExtensionResults: credential.getClientExtensionResults(),
      response: {
        clientDataJSON: encode(response.clientDataJSON), authenticatorData: encode(response.authenticatorData),
        signature: encode(response.signature), userHandle: response.userHandle ? encode(response.userHandle) : undefined,
      },
    },
  })
}
