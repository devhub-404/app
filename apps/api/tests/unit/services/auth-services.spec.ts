import { describe, expect, it } from 'vitest';
import { assertEmailAddressCanBeUsedForIdentity } from '@/modules/auth/application/shared/email-address-policy';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  SESSION_MAX_AGE_SECONDS,
  isSessionSecret,
  nextSessionExpiry,
} from '@/modules/auth/application/sessions/session-policy';
import { Sha256AuthSecretDigestService } from '@/modules/auth/infrastructure/security/sha256-auth-secret-digest.service';
import { createPkcePair } from '@/modules/auth/application/oauth/pkce';

describe('authentication services and policies', () => {
  it('rejects disposable identity email domains and accepts ordinary domains', () => {
    expect(() => assertEmailAddressCanBeUsedForIdentity('person@mailinator.com')).toThrow(
      'DISPOSABLE_EMAIL_NOT_ALLOWED',
    );
    expect(() => assertEmailAddressCanBeUsedForIdentity('person@example.com')).not.toThrow();
  });

  it('recognizes only valid session secrets and exposes the session cookie contract', () => {
    expect(SESSION_COOKIE_NAME).toBe('devhub_session');
    expect(SESSION_MAX_AGE_SECONDS).toBe(30 * 24 * 60 * 60);
    expect(isSessionSecret('a'.repeat(43))).toBe(true);
    expect(isSessionSecret('a'.repeat(42))).toBe(false);
    expect(isSessionSecret('!'.repeat(43))).toBe(false);
    expect(isSessionSecret(null)).toBe(false);
  });

  it('calculates session expiry from the supplied instant', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');

    expect(nextSessionExpiry(now).getTime()).toBe(now.getTime() + SESSION_MAX_AGE_MS);
  });

  it('hashes secrets deterministically and compares them safely', async () => {
    const service = new Sha256AuthSecretDigestService();
    const digest = await service.hash('secret-value');

    await expect(service.compare('secret-value', digest)).resolves.toBe(true);
    await expect(service.compare('other-value', digest)).resolves.toBe(false);
    await expect(service.compare('secret-value', digest.slice(0, -2))).resolves.toBe(false);
  });

  it('creates an RFC 7636 PKCE pair without exposing the verifier as challenge', () => {
    const { codeVerifier, codeChallenge } = createPkcePair();

    expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
    expect(codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(codeChallenge).not.toBe(codeVerifier);
  });
});
