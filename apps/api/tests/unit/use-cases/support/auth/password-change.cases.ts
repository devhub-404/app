import { describe, expect, it } from 'vitest';
import { CompletePasswordChangeCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-change.command';

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

describe('Password change contract commands', () => {
  it('changes the password, preserves the current session and revokes other sessions', async () => {
    const calls: string[] = [];
    const command = new CompletePasswordChangeCommand(
      { getServerPublicKey: async () => ({}) } as never,
      {
        verifySingleUse: async () => ({ sub: 'user-1', credentialId: 'credential-password', jti: 'proof-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        findByUserId: async () => ({
          credentialId: 'credential-password',
          verifier: 'old-verifier',
          lockedUntil: null,
        }),
        updateVerifier: async (_id: string, value: string) => calls.push(`verifier:${value}`),
        resetFailedAttempts: async () => undefined,
      } as never,
      {
        execute: async (userId: string, sessionId: string) => calls.push(`revoke-others:${userId}:${sessionId}`),
      } as never,
      account as never,
    );

    await expect(
      command.execute({
        userId: 'user-1',
        sessionId: 'session-current',
        changeToken: 'change-token',
        registrationRecord: 'new-verifier',
      }),
    ).resolves.toEqual({ changed: true });

    expect(calls).toEqual(['verifier:new-verifier', 'revoke-others:user-1:session-current']);
  });

  it('does not change a password with a token belonging to another user', async () => {
    let updateCalls = 0;
    let revokeCalls = 0;
    const command = new CompletePasswordChangeCommand(
      {} as never,
      {
        verifySingleUse: async () => ({ sub: 'other-user', credentialId: 'credential-password', jti: 'proof-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        findByUserId: async () => ({
          credentialId: 'credential-password',
          verifier: 'old-verifier',
          lockedUntil: null,
        }),
        updateVerifier: async () => {
          updateCalls += 1;
        },
        resetFailedAttempts: async () => undefined,
      } as never,
      {
        execute: async () => {
          revokeCalls += 1;
        },
      } as never,
      account as never,
    );

    await expect(
      command.execute({
        userId: 'user-1',
        sessionId: 'session-current',
        changeToken: 'change-token',
        registrationRecord: 'new-verifier',
      }),
    ).rejects.toThrow();
    expect(updateCalls).toBe(0);
    expect(revokeCalls).toBe(0);
  });
});
