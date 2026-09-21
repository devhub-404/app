import './support/auth/login-recovery-surface.cases';
import './support/auth/account-lifecycle-events.cases';
import './support/auth/session-identity-surface.cases';
import './support/auth/email-flows.cases';
import './support/auth/account-recovery.cases';
import './support/auth/auth-guard.cases';
import './support/auth/possession-proof.cases';
import './support/auth/login-email-policy.cases';
import './support/auth/oauth-link.cases';
import './support/auth/oauth-pkce.cases';
import './support/auth/passkey.cases';
import './support/auth/password-change.cases';
import './support/auth/password-recovery.cases';
import './support/auth/password-registration.cases';
import './support/auth/session-access.cases';
import './support/auth/session-commands.cases';
import './support/auth/session-policy.cases';
import './support/auth/totp.cases';
import './support/auth/role-access.cases';
import { describe, expect, it } from 'vitest';
import { HandleAuthenticatedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-authenticated-login.command';
import { HandleFailedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-failed-login.command';
import { DeleteCredentialCommand } from '@/modules/auth/application/passkeys/use-cases/command/delete-credential.command';

describe('Auth contract commands', () => {
  it('locks only the password credential when password failure handling applies a lock', async () => {
    const credentialCalls: string[] = [];
    const command = new HandleFailedLoginCommand({
      findByUserId: async () => ({
        credentialId: 'credential-password-1',
        userId: 'user-1',
        // The contract does not define the numeric threshold; this fixture
        // represents the command state in which a lock is required.
        failedAttempts: 4,
        lockedUntil: null,
      }),
      incrementFailedAttempts: async (credentialId: string) => {
        credentialCalls.push(`increment:${credentialId}`);
      },
      setLockedUntil: async (credentialId: string) => {
        credentialCalls.push(`lock:${credentialId}`);
      },
    } as never);

    const result = await command.execute('user-1');

    expect(result.counted).toBe(true);
    expect(result.locked).toBe(true);
    expect(result.lockedUntil).toBeInstanceOf(Date);
    expect(credentialCalls).toEqual(['increment:credential-password-1', 'lock:credential-password-1']);
  });

  it.each(['deactivated', 'suspended', 'banned'] as const)(
    'does not issue a session for a %s account',
    async (status) => {
      let sessionCalls = 0;
      const command = new HandleAuthenticatedLoginCommand(
        {
          getAuthenticationView: async () => ({
            userId: 'user-1',
            status,
            mfaEnabled: false,
            lockedUntil: null,
            deletedAt: null,
            primaryEmailVerified: true,
            backupEmailVerified: false,
            role: null,
          }),
        } as never,
        {
          execute: async () => {
            sessionCalls += 1;

            return { sessionSecret: 'session-secret' };
          },
        } as never,
        {} as never,
        {} as never,
        { signSingleUse: async () => 'reactivation-token' } as never,
      );

      const result = command.execute({
        userId: 'user-1',
        email: 'user@example.com',
        authMethod: 'password',
      });

      if (status === 'deactivated') {
        await expect(result).resolves.toEqual({ reactivationRequired: true, token: 'reactivation-token' });
      } else {
        await expect(result).rejects.toMatchObject({ message: 'USER_CANNOT_AUTHENTICATE' });
      }

      expect(sessionCalls).toBe(0);
    },
  );

  it('issues only an MFA challenge when the Account has MFA enabled', async () => {
    const calls: string[] = [];
    const command = new HandleAuthenticatedLoginCommand(
      {
        getAuthenticationView: async () => ({
          userId: 'user-1',
          status: 'active',
          mfaEnabled: true,
          lockedUntil: null,
          deletedAt: null,
          primaryEmailVerified: true,
          backupEmailVerified: false,
          role: 'admin',
        }),
      } as never,
      {
        execute: async () => {
          calls.push('session');

          return { sessionSecret: 'must-not-exist' };
        },
      } as never,
      {
        execute: async () => {
          calls.push('challenge');

          return { mfaRequired: true as const, token: 'mfa-token', methods: ['totp', 'recovery_code'] };
        },
      } as never,
      {
        notifyIfEnabled: async () => {
          calls.push('notify');
        },
      } as never,
      {} as never,
      {},
    );

    await expect(
      command.execute({
        userId: 'user-1',
        email: 'user@example.com',
        authMethod: 'password',
      }),
    ).resolves.toEqual({
      mfaRequired: true,
      token: 'mfa-token',
      methods: ['totp', 'recovery_code'],
    });
    expect(calls).toEqual(['challenge']);
  });

  it('deletes an owned removable credential only after possession proof', async () => {
    const attempts: Array<{ userId: string; credentialId: string }> = [];
    const proofCalls: string[] = [];
    const deleteCredential = vi.fn(async () => undefined);
    const command = new DeleteCredentialCommand(
      {
        findById: async (id: string) => ({ id, userId: 'user-1', type: 'passkey' as const }),
        countByUserId: async () => 2,
        deleteById: async (id: string) => {
          attempts.push({ userId: 'user-1', credentialId: id });
          await deleteCredential();
        },
      } as never,
      {
        execute: async (userId: string, sessionId: string) => {
          proofCalls.push(`${userId}:${sessionId}`);

          return { accepted: true };
        },
      } as never,
    );

    await command.execute('user-1', 'session-1', 'credential-1');

    expect(attempts).toEqual([{ userId: 'user-1', credentialId: 'credential-1' }]);
    expect(deleteCredential).toHaveBeenCalledOnce();
    expect(proofCalls).toEqual(['user-1:session-1']);
  });

  it('fails closed when the atomic repository says the credential is not owned/found', async () => {
    let attempts = 0;
    const command = new DeleteCredentialCommand(
      {
        findById: async () => {
          attempts += 1;

          return null;
        },
      } as never,
      { execute: async () => ({ accepted: true }) } as never,
    );

    await expect(command.execute('user-1', 'session-1', 'credential-1')).rejects.toThrow();
    expect(attempts).toBe(1);
  });

  it('never deletes the password credential through the generic delete operation', async () => {
    const command = new DeleteCredentialCommand(
      { findById: async () => ({ id: 'password-credential', userId: 'user-1', type: 'password' as const }) } as never,
      { execute: async () => ({ accepted: true }) } as never,
    );

    await expect(command.execute('user-1', 'session-1', 'password-credential')).rejects.toThrow();
  });

  it('does not reach persistence when possession proof is rejected', async () => {
    let deleteAttempts = 0;
    const command = new DeleteCredentialCommand(
      {
        findById: async () => {
          deleteAttempts += 1;

          return { id: 'credential-1', userId: 'user-1', type: 'passkey' as const };
        },
      } as never,
      {
        execute: async () => {
          throw new Error('possession proof required');
        },
      } as never,
    );

    await expect(command.execute('user-1', 'session-1', 'credential-1')).rejects.toThrow('possession proof required');
    expect(deleteAttempts).toBe(0);
  });

  it('preserves the last primary credential when the atomic repository loses that precondition', async () => {
    const command = new DeleteCredentialCommand(
      {
        findById: async () => ({ id: 'credential-1', userId: 'user-1', type: 'passkey' as const }),
        countByUserId: async () => 1,
      } as never,
      { execute: async () => ({ accepted: true }) } as never,
    );

    await expect(command.execute('user-1', 'session-1', 'credential-1')).rejects.toThrow();
  });
});
