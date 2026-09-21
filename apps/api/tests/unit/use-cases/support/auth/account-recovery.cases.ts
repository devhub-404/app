import { describe, expect, it } from 'vitest';
import { StartAccountRecoveryCommand } from '@/modules/auth/application/auth/use-cases/command/start-account-recovery.command';
import { CompleteAccountRecoveryCommand } from '@/modules/auth/application/auth/use-cases/command/complete-account-recovery.command';

describe('Account recovery contract commands', () => {
  it('does not send recovery email for a primary or unverified email', async () => {
    let emailCalls = 0;
    const command = new StartAccountRecoveryCommand(
      {} as never,
      { findByEmail: async () => ({ userId: 'user-1', type: 'primary', verifiedAt: new Date() }) } as never,
      {} as never,
      {
        emitAsync: async () => {
          emailCalls += 1;
        },
      } as never,
    );

    await expect(command.execute('user@example.com')).resolves.toEqual({ acknowledged: true });
    expect(emailCalls).toBe(0);
  });

  it('sends recovery only to a verified backup email while returning a generic acknowledgement', async () => {
    let emailCalls = 0;
    const command = new StartAccountRecoveryCommand(
      { findById: async () => ({ status: 'active' }) } as never,
      {
        findByEmail: async () => ({
          userId: 'user-1',
          email: 'backup@example.com',
          type: 'backup',
          verifiedAt: new Date(),
        }),
      } as never,
      { signSingleUse: async () => 'recovery-token' } as never,
      {
        emitAsync: async () => {
          emailCalls += 1;
        },
      } as never,
    );

    await expect(command.execute('backup@example.com')).resolves.toEqual({ acknowledged: true });
    expect(emailCalls).toBe(1);
  });

  it('does not complete recovery when the token is not tied to a verified backup email', async () => {
    let revokeCalls = 0;
    const command = new CompleteAccountRecoveryCommand(
      { verifySingleUse: async () => ({ sub: 'user-1', email: 'backup@example.com', jti: 'proof-1' }) } as never,
      { findById: async () => ({ status: 'active' }) } as never,
      {
        findByEmail: async () => ({
          userId: 'user-1',
          email: 'backup@example.com',
          type: 'primary',
          verifiedAt: new Date(),
        }),
      } as never,
      {} as never,
      {} as never,
      {
        execute: async () => {
          revokeCalls += 1;
        },
      } as never,
    );

    await expect(command.execute({ token: 'recovery-token' })).rejects.toThrow();
    expect(revokeCalls).toBe(0);
  });

  it('may disable MFA during recovery even when privileged roles remain assigned', async () => {
    const effects: string[] = [];
    const command = new CompleteAccountRecoveryCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', email: 'backup@example.com', jti: 'proof-1' }),
        consumeSingleUse: async () => {
          effects.push('consume-proof');

          return true;
        },
      } as never,
      {
        findById: async () => ({ status: 'active', role: 'admin', mfaEnabled: true }),
        setMfaEnabled: async (_id: string, enabled: boolean) => {
          effects.push(`account-mfa:${enabled}`);

          return true;
        },
        setLockedUntil: async () => {
          effects.push('unlock');
        },
      } as never,
      {
        findByEmail: async () => ({
          userId: 'user-1',
          email: 'backup@example.com',
          type: 'backup',
          verifiedAt: new Date(),
        }),
      } as never,
      {
        deleteByUserId: async () => {
          effects.push('totp');
        },
      } as never,
      {
        deleteByUserId: async () => {
          effects.push('recovery-codes');
        },
      } as never,
      {
        execute: async () => {
          effects.push('sessions');
        },
      } as never,
    );

    await expect(command.execute({ token: 'recovery-token' })).resolves.toEqual({
      recovered: true,
    });
    expect(effects).toEqual(['account-mfa:false', 'unlock', 'sessions', 'totp', 'recovery-codes', 'consume-proof']);
  });

  it('does not leave MFA required when idempotent factor cleanup fails after recovery state changes', async () => {
    const effects: string[] = [];
    let mfaEnabled = true;
    let sessionsRevoked = false;
    const command = new CompleteAccountRecoveryCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', email: 'backup@example.com', jti: 'proof-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        findById: async () => ({ status: 'active', mfaEnabled }),
        setMfaEnabled: async (_id: string, enabled: boolean) => {
          mfaEnabled = enabled;
          effects.push(`account-mfa:${enabled}`);

          return true;
        },
        setLockedUntil: async () => effects.push('unlock'),
      } as never,
      {
        findByEmail: async () => ({
          userId: 'user-1',
          email: 'backup@example.com',
          type: 'backup',
          verifiedAt: new Date(),
        }),
      } as never,
      {
        deleteByUserId: async () => {
          effects.push('totp-cleanup');

          throw new Error('transient cleanup failure');
        },
      } as never,
      { deleteByUserId: async () => effects.push('codes-cleanup') } as never,
      {
        execute: async () => {
          sessionsRevoked = true;
          effects.push('sessions');
        },
      } as never,
    );

    await expect(command.execute({ token: 'recovery-token' })).rejects.toThrow('transient cleanup failure');

    expect(mfaEnabled).toBe(false);
    expect(sessionsRevoked).toBe(true);
    expect(effects).toEqual(['account-mfa:false', 'unlock', 'sessions', 'totp-cleanup']);
  });

  it('completes recovery without changing the primary email', async () => {
    let primaryChanged = false;
    let revoked = false;
    const command = new CompleteAccountRecoveryCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', email: 'backup@example.com', jti: 'proof-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        findById: async () => ({ status: 'active' }),
        setMfaEnabled: async () => true,
        setLockedUntil: async () => undefined,
      } as never,
      {
        findByEmail: async (email: string) =>
          email === 'backup@example.com' ? { userId: 'user-1', email, type: 'backup', verifiedAt: new Date() } : null,
        upsertPrimary: async () => {
          primaryChanged = true;
        },
      } as never,
      { deleteByUserId: async () => undefined } as never,
      { deleteByUserId: async () => undefined } as never,
      {
        execute: async () => {
          revoked = true;
        },
      } as never,
    );

    await expect(command.execute({ token: 'recovery-token' })).resolves.toEqual({ recovered: true });
    expect(primaryChanged).toBe(false);
    expect(revoked).toBe(true);
  });

  it('rejects a replay when the single-use recovery proof cannot be consumed', async () => {
    const command = new CompleteAccountRecoveryCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', email: 'backup@example.com', jti: 'proof-1' }),
        consumeSingleUse: async () => false,
      } as never,
      {
        findById: async () => ({ status: 'active' }),
        setMfaEnabled: async () => true,
        setLockedUntil: async () => undefined,
      } as never,
      {
        findByEmail: async () => ({
          userId: 'user-1',
          email: 'backup@example.com',
          type: 'backup',
          verifiedAt: new Date(),
        }),
      } as never,
      { deleteByUserId: async () => undefined } as never,
      { deleteByUserId: async () => undefined } as never,
      { execute: async () => undefined } as never,
    );

    await expect(command.execute({ token: 'recovery-token' })).rejects.toMatchObject({
      message: 'AUTH_TOKEN_INVALID',
    });
  });
});
