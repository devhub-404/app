import { describe, expect, it } from 'vitest';
import { CompletePasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-recovery.command';

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

describe('Password recovery contract commands', () => {
  it('replaces the password verifier and revokes all sessions', async () => {
    const calls: string[] = [];
    const command = new CompletePasswordRecoveryCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', email: 'user@example.com', jti: 'proof-1' }),
        consumeSingleUse: async () => true,
      } as never,
      { getServerPublicKey: async () => ({}) } as never,
      {
        findByUserId: async () => ({
          credentialId: 'credential-password',
          verifier: 'old-verifier',
          lockedUntil: null,
        }),
        updateVerifier: async (_id: string, value: string) => calls.push(`verifier:${value}`),
        resetFailedAttempts: async () => undefined,
        setLockedUntil: async () => undefined,
      } as never,
      { execute: async (userId: string) => calls.push(`revoke:${userId}`) } as never,
      account as never,
    );

    await expect(command.execute({ token: 'recovery-token', registrationRecord: 'new-verifier' })).resolves.toEqual({ recovered: true });
    expect(calls).toEqual(['verifier:new-verifier', 'revoke:user-1']);
  });

  it('does not recover an account without an existing password credential', async () => {
    let revokeCalls = 0;
    const command = new CompletePasswordRecoveryCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', email: 'user@example.com', jti: 'proof-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {} as never,
      { findByUserId: async () => null } as never,
      {
        execute: async () => {
          revokeCalls += 1;
        },
      } as never,
      account as never,
    );

    await expect(command.execute({ token: 'recovery-token', registrationRecord: 'new-verifier' })).rejects.toThrow();
    expect(revokeCalls).toBe(0);
  });
});
