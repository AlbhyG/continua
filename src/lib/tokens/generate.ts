import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure verification token.
 *
 * @returns A 43-character URL-safe base64url string with 256 bits of entropy
 */
export function generateVerificationToken(): string {
  // Generate 32 random bytes (256 bits)
  const buffer = randomBytes(32);

  // Convert to base64url encoding (URL-safe, no padding)
  // Base64url replaces + with -, / with _, and removes = padding
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Validate that a token matches the expected format.
 *
 * Used by verification page to validate format before database lookup.
 *
 * @param token - The token string to validate
 * @returns true if token is a valid 43-character base64url string
 */
export function isValidTokenFormat(token: string): boolean {
  // Token must be exactly 43 characters: A-Z, a-z, 0-9, _, -
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
