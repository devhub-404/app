import { describe, expect, it } from 'vitest';
import {
  isSessionSecret,
  nextSessionExpiry,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  SESSION_MAX_AGE_SECONDS,
} from '@/modules/auth/application/sessions/session-policy';
import { clearSessionCookie, setSessionCookie } from '@/modules/auth/presentation/utils/auth-cookies.util';

const validSecret = 'A'.repeat(43);

describe('Opaque Session policy', () => {
  it('accepts only the exact 32-byte base64url Session secret representation', () => {
    expect(isSessionSecret(validSecret)).toBe(true);
    expect(isSessionSecret('A'.repeat(42))).toBe(false);
    expect(isSessionSecret('A'.repeat(44))).toBe(false);
    expect(isSessionSecret(`${'A'.repeat(42)}=`)).toBe(false);
    expect(isSessionSecret(`${'A'.repeat(42)}+`)).toBe(false);
  });

  it('starts or renews the Session expiry exactly 30 days from the fresh proof time', () => {
    const proofAt = new Date('2026-08-30T12:00:00.000Z');
    expect(nextSessionExpiry(proofAt).getTime()).toBe(proofAt.getTime() + SESSION_MAX_AGE_MS);
  });

  it('emits a host-only hardened Session cookie and clears the same host-only cookie', () => {
    const setCalls: unknown[][] = [];
    const clearCalls: unknown[][] = [];
    const reply = {
      setCookie: (...args: unknown[]) => setCalls.push(args),
      clearCookie: (...args: unknown[]) => clearCalls.push(args),
    } as never;

    setSessionCookie(reply, validSecret, true);
    clearSessionCookie(reply, true);

    expect(setCalls).toEqual([
      [
        SESSION_COOKIE_NAME,
        validSecret,
        {
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          path: '/',
          maxAge: SESSION_MAX_AGE_SECONDS,
        },
      ],
    ]);
    expect(clearCalls).toEqual([[SESSION_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' }]]);
    expect((setCalls[0]?.[2] as Record<string, unknown>)['domain']).toBeUndefined();
  });
});
