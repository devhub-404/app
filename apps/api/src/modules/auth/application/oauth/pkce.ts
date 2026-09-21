import { createHash, randomBytes } from 'node:crypto';

export function createPkcePair(): { codeVerifier: string; codeChallenge: string } {
  // RFC 7636: 32 random octets encoded as base64url produce a 43-char verifier,
  // within the required 43..128 range. S256 hashes the verifier, never sends it
  // directly as the challenge.
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier, 'ascii').digest('base64url');

  return { codeVerifier, codeChallenge };
}
