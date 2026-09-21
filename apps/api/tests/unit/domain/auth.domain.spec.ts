import { describe, expect, it } from 'vitest';
import { MfaRecoveryCode } from '@/modules/auth/domain/entities/mfa-recovery-code';
import { MfaTotp } from '@/modules/auth/domain/entities/mfa-totp';
import { PasswordCredential } from '@/modules/auth/domain/entities/password-credential';
import { Session } from '@/modules/auth/domain/entities/session';
import { DomainError } from '@/shared/errors/domain-error';

describe('Session domain', () => {
  const activeSession = () =>
    Session.create('session-1', {
      userId: 'user-1',
      authMethod: 'password',
      sessionSecretHash: 'hash-1',
      expiresAt: new Date(Date.now() + 60_000),
    });

  it('creates an active session with its authentication method and secret hash', () => {
    const session = activeSession();

    expect(session.userId).toBe('user-1');
    expect(session.authMethod).toBe('password');
    expect(session.sessionSecretHash).toBe('hash-1');
    expect(session.isRevoked).toBe(false);
    expect(session.isExpired).toBe(false);
  });

  it('AUTH-RF-007 — renews authentication time and expiry only after active proof', () => {
    const session = activeSession();
    const lastProofOfPossessionAt = new Date('2026-01-01T00:00:00.000Z');
    const expiresAt = new Date('2026-01-31T00:00:00.000Z');

    session.renewAfterProof(lastProofOfPossessionAt, expiresAt);

    expect(session.lastProofOfPossessionAt).toBe(lastProofOfPossessionAt);
    expect(session.expiresAt).toBe(expiresAt);
  });

  it('revokes an active session exactly once', () => {
    const session = activeSession();
    const revokedAt = new Date('2026-01-01T00:00:00.000Z');

    session.revoke(revokedAt);

    expect(session.isRevoked).toBe(true);
    expect(session.revokedAtValue).toBe(revokedAt);
    expect(() => session.revoke()).toThrowError(new DomainError('SESSION_INVALID_STATUS'));
  });

  it('does not revoke an expired or already revoked session', () => {
    const expired = Session.create('session-1', {
      userId: 'user-1',
      authMethod: 'password',
      sessionSecretHash: 'hash-1',
      expiresAt: new Date(Date.now() - 1),
    });
    expect(expired.isExpired).toBe(true);
    expect(() => expired.revoke()).toThrowError(new DomainError('SESSION_INVALID_STATUS'));

    const revoked = Session.rehydrate('session-2', {
      userId: 'user-1',
      authMethod: 'password',
      sessionSecretHash: 'hash-2',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(() => revoked.revoke()).toThrowError(new DomainError('SESSION_INVALID_STATUS'));
  });
});

describe('MfaTotp domain', () => {
  it('creates pending MFA, activates it once and disables it once', () => {
    const totp = MfaTotp.createPending('user-1', 'encrypted-secret');

    expect(totp.userId).toBe('user-1');
    expect(totp.status).toBe('pending');
    expect(totp.encryptedSecret).toBe('encrypted-secret');

    totp.activate();
    expect(totp.status).toBe('active');

    totp.disable();
    expect(totp.status).toBe('disabled');
  });

  it('rejects activation outside pending and disable outside active', () => {
    const pending = MfaTotp.createPending('user-1', 'secret');
    expect(() => pending.disable()).toThrowError(new DomainError('AUTH_MFA_NOT_ENABLED'));

    pending.activate();
    expect(() => pending.activate()).toThrowError(new DomainError('AUTH_INVALID_CREDENTIAL'));
    pending.disable();
    expect(() => pending.disable()).toThrowError(new DomainError('AUTH_MFA_NOT_ENABLED'));
  });
});

describe('MfaRecoveryCode domain', () => {
  it('starts unused and consumes a recovery code once', () => {
    const code = MfaRecoveryCode.rehydrate({ id: 'code-1', userId: 'user-1', codeHash: 'hash-1' });
    const usedAt = new Date('2026-01-01T00:00:00.000Z');

    expect(code.isUsed).toBe(false);
    code.consume(usedAt);

    expect(code.isUsed).toBe(true);
    expect(() => code.consume()).toThrowError(new DomainError('AUTH_INVALID_CREDENTIAL'));
  });
});

describe('PasswordCredential domain', () => {
  it('preserves the stable OPAQUE identifier and replaces the verifier', () => {
    const credential = PasswordCredential.rehydrate({
      credentialId: 'credential-1',
      userId: 'user-1',
      verifier: 'verifier-old',
      opaqueUserIdentifier: 'opaque-user-1',
      failedAttempts: 0,
      lockedUntil: null,
    });

    credential.replaceVerifier('verifier-new');

    expect(credential.verifier).toBe('verifier-new');
    expect(credential.opaqueUserIdentifier).toBe('opaque-user-1');
    expect(credential.userId).toBe('user-1');
  });
});
