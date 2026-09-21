import { describe, expect, it } from 'vitest';
import { VerifyPossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/verify-possession-proof.command';
import { AppError } from '@/shared/errors/app-error';
import { SESSION_MAX_AGE_MS } from '@/modules/auth/application/sessions/session-policy';

const account = {
  getAuthenticationView: async () => ({
    userId: 'user-1',
    status: 'active' as const,
    mfaEnabled: false,
    lockedUntil: null,
    deletedAt: null,
    primaryEmailVerified: true,
    backupEmailVerified: false,
    role: null,
  }),
};

describe('Possession proof contract commands', () => {
  it('accepts a recent authenticated session without renewing its lifetime', async () => {
    let renewCalls = 0;
    const command = new VerifyPossessionProofCommand(
      account as never,
      {} as never,
      {} as never,
      {
        findActiveById: async () => ({ lastProofOfPossessionAt: new Date() }),
        renewAfterProof: async () => {
          renewCalls += 1;

          return true;
        },
      } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(command.execute('user-1', 'session-1')).resolves.toEqual({ accepted: true });
    expect(renewCalls).toBe(0);
  });

  it('accepts the current password as fresh possession proof and renews the Session for 30 days', async () => {
    let passwordCalls = 0;
    const renewals: Array<{ lastProofOfPossessionAt: Date; expiresAt: Date }> = [];
    const command = new VerifyPossessionProofCommand(
      account as never,
      {
        finishLogin: async () => {
          passwordCalls += 1;
        },
      } as never,
      {
        findByUserId: async () => ({ credentialId: 'credential-password', lockedUntil: null }),
        resetFailedAttempts: async () => undefined,
      } as never,
      {
        findActiveById: async () => null,
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
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      command.execute('user-1', 'session-1', {
        currentPassword: { serverLoginState: 'server-state', finishLoginRequest: 'finish-request' },
      }),
    ).resolves.toEqual({ accepted: true });
    expect(passwordCalls).toBe(1);
    expect(renewals).toHaveLength(1);
    expect(renewals[0].expiresAt.getTime() - renewals[0].lastProofOfPossessionAt.getTime()).toBe(SESSION_MAX_AGE_MS);
  });

  it('accepts a valid code sent to the verified primary email for non-MFA possession proof and renews the Session', async () => {
    let renewCalls = 0;
    const command = new VerifyPossessionProofCommand(
      account as never,
      {} as never,
      {} as never,
      {
        findActiveById: async () => null,
        renewAfterProof: async () => {
          renewCalls += 1;

          return true;
        },
      } as never,
      {
        findPrimaryByUserId: async () => ({ email: 'user@example.com', verifiedAt: new Date() }),
        findByEmail: async () => ({
          userId: 'user-1',
          email: 'user@example.com',
          type: 'primary',
          verifiedAt: new Date(),
        }),
      } as never,
      {
        verifySingleUseCode: async () => ({ jti: 'proof-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {} as never,
    );

    await expect(command.execute('user-1', 'session-1', { emailCode: 'email-proof-code' })).resolves.toEqual({
      accepted: true,
    });
    expect(renewCalls).toBe(1);
  });

  it('does not accept email proof as MFA assurance', async () => {
    const mfaAccount = {
      getAuthenticationView: async () => ({ ...(await account.getAuthenticationView()), mfaEnabled: true }),
    };
    let emailVerificationCalls = 0;
    const command = new VerifyPossessionProofCommand(
      mfaAccount as never,
      {} as never,
      {} as never,
      { findActiveById: async () => null } as never,
      {} as never,
      {
        verifySingleUse: async () => {
          emailVerificationCalls += 1;

          return {};
        },
      } as never,
      {} as never,
    );

    await expect(
      command.execute('user-1', 'session-1', { emailCode: 'email-proof-code', requiredAssurance: 'mfa' }),
    ).resolves.toEqual({ accepted: false });
    expect(emailVerificationCalls).toBe(0);
  });

  it('accepts a recently MFA-authenticated session as current assurance without sliding the expiry', async () => {
    const mfaAccount = {
      getAuthenticationView: async () => ({ ...(await account.getAuthenticationView()), mfaEnabled: true }),
    };
    let renewCalls = 0;
    const command = new VerifyPossessionProofCommand(
      mfaAccount as never,
      {} as never,
      {} as never,
      {
        findActiveById: async () => ({ lastProofOfPossessionAt: new Date(), authMethod: 'password' }),
        renewAfterProof: async () => {
          renewCalls += 1;

          return true;
        },
      } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(command.execute('user-1', 'session-1', { requiredAssurance: 'current' })).resolves.toEqual({
      accepted: true,
    });
    expect(renewCalls).toBe(0);
  });

  it('does not accept an operation without a valid possession proof', async () => {
    const command = new VerifyPossessionProofCommand(
      account as never,
      {} as never,
      {} as never,
      { findActiveById: async () => null } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(command.execute('user-1', 'session-1')).resolves.toEqual({ accepted: false });
  });

  it('requires the current password when that proof mode is explicitly required', async () => {
    const command = new VerifyPossessionProofCommand(
      account as never,
      {} as never,
      {} as never,
      { findActiveById: async () => null } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(command.execute('user-1', 'session-1', { requireCurrentPassword: true })).rejects.toThrowError(
      new AppError('AUTH_REQUIRED'),
    );
  });
});
