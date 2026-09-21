import { describe, expect, it } from 'vitest';
import { StartTotpEnrollmentCommand } from '@/modules/auth/application/mfa/use-cases/command/start-totp-enrollment.command';
import { CompleteTotpEnrollmentCommand } from '@/modules/auth/application/mfa/use-cases/command/complete-totp-enrollment.command';
import { DisableTotpCommand } from '@/modules/auth/application/mfa/use-cases/command/disable-totp.command';
import { VerifyTotpCommand } from '@/modules/auth/application/mfa/use-cases/command/verify-totp.command';
import { VerifyRecoveryCodeCommand } from '@/modules/auth/application/mfa/use-cases/command/verify-recovery-code.command';
import { RegenerateRecoveryCodesCommand } from '@/modules/auth/application/mfa/use-cases/command/regenerate-recovery-codes.command';
import { AppError } from '@/shared/errors/app-error';

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    voluntaryStatus: 'active',
    moderationStatus: 'none',
    deletionStatus: 'none',
    deletionRequestedAt: null,
    status: 'active',
    mfaEnabled: false,
    lockedUntil: null,
    deletedAt: null,
    primaryEmailVerified: true,
    backupEmailVerified: false,
    role: null,
    ...overrides,
  };
}

function proof() {
  return { execute: async () => ({ allowed: true }) };
}

describe('TOTP use cases', () => {
  it('starts enrollment in pending state after possession proof', async () => {
    const calls: string[] = [];
    const command = new StartTotpEnrollmentCommand(
      {
        generateBase32Secret: () => 'SECRET',
        generateOtpAuthUri: () => 'otpauth://totp/DevHub:user-1',
      } as never,
      { encryptBase32Secret: async () => 'ENCRYPTED' } as never,
      {
        upsert: async (input: unknown) => calls.push(`upsert:${JSON.stringify(input)}`),
      } as never,
      { findById: async () => user() } as never,
      proof() as never,
    );

    const result = await command.execute('user-1', 'session-1');

    expect(result).toEqual({
      secret: 'SECRET',
      otpauthUri: 'otpauth://totp/DevHub:user-1',
      status: 'pending',
    });
    expect(calls).toEqual(['upsert:{"userId":"user-1","encryptedSecret":"ENCRYPTED","status":"pending"}']);
  });

  it('completes enrollment, enables MFA and issues a privileged-assurance Session', async () => {
    const calls: string[] = [];
    const command = new CompleteTotpEnrollmentCommand(
      { verifyToken: () => true, generateBackupCodes: () => ['CODE-1', 'CODE-2'] } as never,
      { decryptBase32Secret: async () => 'SECRET' } as never,
      {
        findByUserId: async () => ({ status: 'pending', encryptedSecret: 'ENCRYPTED' }),
        activateEnrollment: async (userId: string, hashes: string[]) => {
          calls.push(`${userId}:${hashes.join(',')}`);

          return true;
        },
      } as never,
      { hash: async (value: string) => `hash:${value}` } as never,
      {
        findById: async () => user({ role: 'admin' }),
        setMfaEnabled: async (id: string, enabled: boolean) => {
          calls.push(`mfa:${id}:${enabled}`);

          return true;
        },
      } as never,
      proof() as never,
      {
        execute: async (input: { userId: string; authMethod: string }) => {
          calls.push(`session:${input.userId}:${input.authMethod}`);

          return { sessionSecret: 'elevated-secret' };
        },
      } as never,
      {
        execute: async (userId: string) => {
          calls.push(`revoke-all:${userId}`);
        },
      } as never,
      { findActiveById: async () => ({ authMethod: 'password' }) } as never,
    );

    const result = await command.execute({ userId: 'user-1', sessionId: 'session-1', code: '123456' });

    expect(result).toEqual({
      recoveryCodes: ['CODE-1', 'CODE-2'],
      sessionSecret: 'elevated-secret',
    });
    expect(calls).toEqual([
      'user-1:hash:CODE-1,hash:CODE-2',
      'mfa:user-1:true',
      'revoke-all:user-1',
      'session:user-1:password',
    ]);
  });

  it('requires a fresh TOTP proof to disable MFA, preserves roles and renews the current Session', async () => {
    const calls: string[] = [];
    const renewals: Array<{ lastProofOfPossessionAt: Date; expiresAt: Date }> = [];
    const command = new DisableTotpCommand(
      {
        findByUserId: async () => ({ status: 'active', encryptedSecret: 'ENCRYPTED' }),
        disableMfa: async (id: string) => {
          calls.push(`disable:${id}`);

          return { userId: id, encryptedSecret: 'ENCRYPTED', recoveryCodes: [] };
        },
        restoreDisabledMfa: async () => {
          throw new Error('must not restore successful disable');
        },
      } as never,
      {} as never,
      {
        findById: async () => user({ mfaEnabled: true, role: 'admin' }),
        setMfaEnabled: async (id: string, enabled: boolean) => {
          calls.push(`mfa:${id}:${enabled}`);

          return true;
        },
      } as never,
      { verifyToken: ({ token }: { token: string }) => token === '123456' } as never,
      { decryptBase32Secret: async () => 'SECRET' } as never,
      {} as never,
      {
        renewAfterProof: async (
          _userId: string,
          _sessionId: string,
          lastProofOfPossessionAt: Date,
          expiresAt: Date,
        ) => {
          renewals.push({ lastProofOfPossessionAt, expiresAt });

          return true;
        },
      } as never,
    );

    await command.execute('user-1', 'session-1', { method: 'totp', code: '123456' });
    expect(calls).toEqual(['disable:user-1', 'mfa:user-1:false']);
    expect(renewals).toHaveLength(1);
    expect(renewals[0].expiresAt.getTime() - renewals[0].lastProofOfPossessionAt.getTime()).toBe(
      30 * 24 * 60 * 60 * 1000,
    );
  });

  it('allows a single-use recovery code as the explicit MFA proof for disable', async () => {
    let consumed = 0;
    const command = new DisableTotpCommand(
      {
        findByUserId: async () => ({ status: 'active', encryptedSecret: 'ENCRYPTED' }),
        disableMfa: async () => ({ userId: 'user-1', encryptedSecret: 'ENCRYPTED', recoveryCodes: [] }),
        restoreDisabledMfa: async () => undefined,
      } as never,
      {
        findUnusedByUserIdAndHash: async (_userId: string, hash: string) => {
          if (hash !== 'hash:RECOVERY-1' || consumed > 0) return null;

          return { id: 'code-1' };
        },
        consumeUnusedByUserIdAndHash: async (_userId: string, hash: string) => {
          if (hash !== 'hash:RECOVERY-1' || consumed > 0) return null;
          consumed += 1;

          return { id: 'code-1' };
        },
      } as never,
      {
        findById: async () => user({ mfaEnabled: true }),
        setMfaEnabled: async () => true,
      } as never,
      {} as never,
      {} as never,
      { hash: async (value: string) => `hash:${value}` } as never,
      { renewAfterProof: async () => true } as never,
    );

    await expect(
      command.execute('user-1', 'session-1', { method: 'recovery_code', code: 'RECOVERY-1' }),
    ).resolves.toBeUndefined();
    expect(consumed).toBe(1);
  });

  it('restores the exact Auth-side MFA state if the Account projection update fails', async () => {
    const state = {
      totpStatus: 'active',
      recoveryCodes: [
        { codeHash: 'used-hash', usedAt: new Date('2026-01-01T00:00:00Z') },
        { codeHash: 'unused-hash', usedAt: null },
      ] as Array<{ codeHash: string; usedAt: Date | null }>,
    };
    const command = new DisableTotpCommand(
      {
        findByUserId: async () => ({ status: state.totpStatus, encryptedSecret: 'ENCRYPTED' }),
        disableMfa: async () => {
          const snapshot = {
            userId: 'user-1',
            encryptedSecret: 'ENCRYPTED',
            recoveryCodes: structuredClone(state.recoveryCodes),
          };
          state.totpStatus = 'disabled';
          state.recoveryCodes = [];

          return snapshot;
        },
        restoreDisabledMfa: async (snapshot: { recoveryCodes: Array<{ codeHash: string; usedAt: Date | null }> }) => {
          state.totpStatus = 'active';
          state.recoveryCodes = snapshot.recoveryCodes;
        },
      } as never,
      {} as never,
      {
        findById: async () => user({ mfaEnabled: true, role: 'admin' }),
        setMfaEnabled: async () => false,
      } as never,
      { verifyToken: () => true } as never,
      { decryptBase32Secret: async () => 'SECRET' } as never,
      {} as never,
      { renewAfterProof: async () => true } as never,
    );

    await expect(command.execute('user-1', 'session-1', { method: 'totp', code: '123456' })).rejects.toThrowError(
      new AppError('USER_NOT_FOUND'),
    );
    expect(state.totpStatus).toBe('active');
    expect(state.recoveryCodes).toEqual([
      { codeHash: 'used-hash', usedAt: new Date('2026-01-01T00:00:00Z') },
      { codeHash: 'unused-hash', usedAt: null },
    ]);
  });

  it('does not issue recovery codes or a Session when another completion already consumed PENDING', async () => {
    let sessionCalls = 0;
    const command = new CompleteTotpEnrollmentCommand(
      { verifyToken: () => true, generateBackupCodes: () => ['CODE-1'] } as never,
      { decryptBase32Secret: async () => 'SECRET' } as never,
      {
        findByUserId: async () => ({ status: 'pending', encryptedSecret: 'ENCRYPTED' }),
        activateEnrollment: async () => false,
      } as never,
      { hash: async (value: string) => `hash:${value}` } as never,
      { findById: async () => user() } as never,
      proof() as never,
      {
        execute: async () => {
          sessionCalls += 1;

          return { sessionSecret: 'must-not-exist' };
        },
      } as never,
      { execute: async () => undefined } as never,
      { findActiveById: async () => ({ authMethod: 'password' }) } as never,
    );

    await expect(command.execute('user-1', 'session-1', '123456')).rejects.toThrowError(
      new AppError('AUTH_INVALID_CREDENTIAL'),
    );
    expect(sessionCalls).toBe(0);
  });

  it('does not start TOTP enrollment without possession proof', async () => {
    let upsertCalls = 0;
    const command = new StartTotpEnrollmentCommand(
      {} as never,
      {} as never,
      {
        upsert: async () => {
          upsertCalls += 1;
        },
      } as never,
      {} as never,
      {
        execute: async () => {
          throw new AppError('AUTH_REQUIRED');
        },
      } as never,
    );

    await expect(command.execute('user-1', 'session-1')).rejects.toThrowError(new AppError('AUTH_REQUIRED'));
    expect(upsertCalls).toBe(0);
  });

  it('does not disable TOTP without a valid fresh MFA proof', async () => {
    let disableCalls = 0;
    const command = new DisableTotpCommand(
      {
        findByUserId: async () => ({ status: 'active', encryptedSecret: 'ENCRYPTED' }),
        disableMfa: async () => {
          disableCalls += 1;

          return { userId: 'user-1', encryptedSecret: 'ENCRYPTED', recoveryCodes: [] };
        },
      } as never,
      {} as never,
      { findById: async () => user({ mfaEnabled: true }) } as never,
      { verifyToken: () => false } as never,
      { decryptBase32Secret: async () => 'SECRET' } as never,
      {} as never,
      {} as never,
    );

    await expect(command.execute('user-1', 'session-1', { method: 'totp', code: '000000' })).rejects.toThrowError(
      new AppError('AUTH_INVALID_CREDENTIAL'),
    );
    expect(disableCalls).toBe(0);
  });

  it('rejects completion outside pending and disable outside active', async () => {
    const complete = new CompleteTotpEnrollmentCommand(
      {} as never,
      {} as never,
      { findByUserId: async () => ({ status: 'active', encryptedSecret: 'ENCRYPTED' }) } as never,
      {} as never,
      { findById: async () => user() } as never,
      proof() as never,
      {} as never,
      {} as never,
      { findActiveById: async () => ({ authMethod: 'password' }) } as never,
    );
    await expect(complete.execute('user-1', 'session-1', '123456')).rejects.toThrowError(
      new AppError('AUTH_INVALID_CREDENTIAL'),
    );

    const disable = new DisableTotpCommand(
      { findByUserId: async () => ({ status: 'pending' }) } as never,
      {} as never,
      { findById: async () => user() } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    await expect(disable.execute('user-1', 'session-1', { method: 'totp', code: '123456' })).rejects.toThrowError(
      new AppError('AUTH_MFA_NOT_ENABLED'),
    );
  });

  it('requires a valid login challenge before TOTP can issue a session', async () => {
    let sessionCalls = 0;
    const command = new VerifyTotpCommand(
      {
        verifySingleUse: async () => {
          throw new Error('invalid challenge');
        },
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {
        execute: async () => {
          sessionCalls += 1;

          return {};
        },
      } as never,
      {} as never,
      {},
      {},
    );

    await expect(command.execute({ token: 'invalid', code: '123456' })).rejects.toThrowError(
      new AppError('AUTH_TOKEN_INVALID'),
    );
    expect(sessionCalls).toBe(0);
  });

  it('issues exactly one session after a valid TOTP challenge and consumes the challenge', async () => {
    const calls: string[] = [];
    const command = new VerifyTotpCommand(
      {
        verifySingleUse: async () => ({
          sub: 'user-1',
          credentialId: 'credential-1',
          method: 'password',
          jti: 'proof-1',
        }),
        consumeSingleUse: async () => {
          calls.push('consume-challenge');

          return true;
        },
      } as never,
      { verifyToken: () => true } as never,
      { decryptBase32Secret: async () => 'SECRET' } as never,
      { findByUserId: async () => ({ status: 'active', encryptedSecret: 'ENCRYPTED' }) } as never,
      {
        execute: async (input: { userId: string; credentialId: string; authMethod: string }) => {
          calls.push(`session:${input.userId}:${input.credentialId}:${input.authMethod}`);

          return { sessionSecret: 'secret' };
        },
      } as never,
      { getAuthenticationView: async () => user({ mfaEnabled: true }) },
    );

    await expect(command.execute({ token: 'challenge', code: '123456' })).resolves.toEqual({
      sessionSecret: 'secret',
    });
    expect(calls).toEqual(['consume-challenge', 'session:user-1:credential-1:password']);
  });

  it('does not consume the challenge or issue a session for an invalid TOTP code', async () => {
    let sessionCalls = 0;
    let consumeCalls = 0;
    const command = new VerifyTotpCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', method: 'password', jti: 'proof-1' }),
        consumeSingleUse: async () => {
          consumeCalls += 1;

          return true;
        },
      } as never,
      { verifyToken: () => false } as never,
      { decryptBase32Secret: async () => 'SECRET' } as never,
      { findByUserId: async () => ({ status: 'active', encryptedSecret: 'ENCRYPTED' }) } as never,
      {
        execute: async () => {
          sessionCalls += 1;

          return {};
        },
      } as never,
      { getAuthenticationView: async () => user({ mfaEnabled: true }) },
    );

    await expect(command.execute({ token: 'challenge', code: 'wrong' })).rejects.toThrow();
    expect(consumeCalls).toBe(0);
    expect(sessionCalls).toBe(0);
  });

  it('requires a valid login challenge before a recovery code can issue a session', async () => {
    let sessionCalls = 0;
    const command = new VerifyRecoveryCodeCommand(
      {
        verifySingleUse: async () => {
          throw new Error('invalid challenge');
        },
      } as never,
      {} as never,
      {} as never,
      {
        execute: async () => {
          sessionCalls += 1;

          return {};
        },
      } as never,
      {} as never,
      { getAuthenticationView: async () => user({ mfaEnabled: true }) },
    );

    await expect(command.execute({ token: 'invalid', recoveryCode: 'CODE-1' })).rejects.toThrowError(
      new AppError('AUTH_TOKEN_INVALID'),
    );
    expect(sessionCalls).toBe(0);
  });

  it('consumes the challenge and recovery code before issuing one session', async () => {
    const calls: string[] = [];
    const command = new VerifyRecoveryCodeCommand(
      {
        verifySingleUse: async () => ({
          sub: 'user-1',
          credentialId: 'credential-1',
          method: 'password',
          jti: 'proof-1',
        }),
        consumeSingleUse: async () => {
          calls.push('consume-challenge');

          return true;
        },
      } as never,
      {
        findUnusedByUserIdAndHash: async () => ({ id: 'recovery-1', usedAt: null }),
        consumeUnusedByUserIdAndHash: async () => {
          calls.push('consume-recovery');

          return { id: 'recovery-1', usedAt: new Date() };
        },
        listByUserId: async () => [{ usedAt: new Date() }],
      } as never,
      { hash: async () => 'hash' } as never,
      {
        execute: async (input: { authMethod: string }) => {
          calls.push(`session:${input.authMethod}`);

          return { sessionSecret: 'session-secret' };
        },
      } as never,
      { getAuthenticationView: async () => user({ mfaEnabled: true }) },
    );

    await expect(command.execute({ token: 'challenge', recoveryCode: 'CODE-1' })).resolves.toMatchObject({
      recoveryCodeUsed: true,
    });
    expect(calls).toEqual(['consume-challenge', 'consume-recovery', 'session:password']);
  });

  it('does not issue a second session when the recovery code is already used', async () => {
    let sessionCalls = 0;
    const command = new VerifyRecoveryCodeCommand(
      { verifySingleUse: async () => ({ sub: 'user-1', method: 'password', jti: 'proof-1' }) } as never,
      { findUnusedByUserIdAndHash: async () => null } as never,
      { hash: async () => 'hash' } as never,
      {
        execute: async () => {
          sessionCalls += 1;

          return {};
        },
      } as never,
      {} as never,
      { getAuthenticationView: async () => user({ mfaEnabled: true }) },
    );

    await expect(command.execute({ token: 'challenge', recoveryCode: 'CODE-1' })).rejects.toThrow();
    expect(sessionCalls).toBe(0);
  });

  it('regenerates recovery codes only for an authenticated account with active MFA', async () => {
    const calls: string[] = [];
    const command = new RegenerateRecoveryCodesCommand(
      {
        findByUserId: async () => ({ status: 'active' }),
        replaceRecoveryCodes: async (userId: string, hashes: string[]) => calls.push(`${userId}:${hashes.join(',')}`),
      } as never,
      { generateBackupCodes: () => ['CODE-1', 'CODE-2'] } as never,
      { hash: async (value: string) => `hash:${value}` } as never,
      {
        findById: async () => user({ mfaEnabled: true }),
        setMfaEnabled: async (id: string, enabled: boolean) => calls.push(`mfa:${id}:${enabled}`),
      } as never,
      proof() as never,
    );

    await expect(command.execute('user-1', 'session-1')).resolves.toEqual({ recoveryCodes: ['CODE-1', 'CODE-2'] });
    expect(calls).toEqual(['user-1:hash:CODE-1,hash:CODE-2']);
  });

  it('does not replace recovery codes when MFA is not active', async () => {
    let replaceCalls = 0;
    const command = new RegenerateRecoveryCodesCommand(
      {
        findByUserId: async () => ({ status: 'disabled' }),
        replaceRecoveryCodes: async () => {
          replaceCalls += 1;
        },
      } as never,
      {} as never,
      {} as never,
      { findById: async () => user() } as never,
      proof() as never,
    );

    await expect(command.execute('user-1', 'session-1')).rejects.toThrow();
    expect(replaceCalls).toBe(0);
  });
});
