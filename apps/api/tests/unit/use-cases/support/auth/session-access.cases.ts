import { describe, expect, it } from 'vitest';
import { SessionAccessValidationService } from '@/modules/auth/public/session-access-validation.service';

const activeSession = {
  sessionId: 'session-1',
  userId: 'user-1',
  mfaEnabled: true,
  role: 'admin' as const,
};

describe('SessionAccessValidationService', () => {
  it('resolves an active session and current roles', async () => {
    const service = new SessionAccessValidationService(
      { findActiveBySecretHash: async () => activeSession } as never,
      { hash: async () => 'hash' } as never,
    );

    await expect(service.resolve('secret')).resolves.toMatchObject({
      sub: 'user-1',
      sid: 'session-1',
      role: 'admin',
    });
  });

  it('accepts a renewed Session older than 30 days when its persisted expiresAt is still active', async () => {
    const renewed = {
      ...activeSession,
    };
    const service = new SessionAccessValidationService(
      { findActiveBySecretHash: async () => renewed } as never,
      { hash: async () => 'hash' } as never,
    );

    await expect(service.resolve('secret')).resolves.toMatchObject({ sub: 'user-1', sid: 'session-1' });
  });

  it('fails closed when the Session is no longer active', async () => {
    const service = new SessionAccessValidationService({ findActiveBySecretHash: async () => null }, {
      hash: async () => 'hash',
    } as never);

    await expect(service.resolve('secret')).resolves.toBeNull();
  });

  it('does not make a persisted privileged role effective without MFA', async () => {
    const withoutMfa = { ...activeSession, mfaEnabled: false };
    const service = new SessionAccessValidationService(
      { findActiveBySecretHash: async () => withoutMfa } as never,
      { hash: async () => 'hash' } as never,
    );

    await expect(service.resolve('secret')).resolves.toMatchObject({ sub: 'user-1', role: null });
  });
});
