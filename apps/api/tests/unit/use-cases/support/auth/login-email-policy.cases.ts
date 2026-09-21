import { describe, expect, it } from 'vitest';
import { StartPasswordLoginCommand } from '@/modules/auth/application/password/use-cases/command/start-password-login.command';
import { CompletePasswordLoginCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-login.command';
import { StartMagicLinkLoginCommand } from '@/modules/auth/application/magic-link/use-cases/command/start-magic-link-login.command';

describe('Authentication email policy contract', () => {
  it('keeps the real OPAQUE credential path for an unverified primary email so valid proof can continue to verification', async () => {
    let opaqueInput: { registrationRecord: string | null; userIdentifier: string } | null = null;
    const command = new StartPasswordLoginCommand(
      {
        startLogin: async (input: { registrationRecord: string | null; userIdentifier: string }) => {
          opaqueInput = input;

          return { serverLoginState: 'state', loginResponse: 'response' };
        },
      } as never,
      { findByEmail: async () => ({ userId: 'user-1' }) } as never,
      {
        findByUserId: async () => ({
          credentialId: 'credential-1',
          opaqueUserIdentifier: 'opaque-user-1',
          verifier: 'verifier',
          lockedUntil: null,
        }),
      } as never,
      {
        getAuthenticationView: async () => ({
          userId: 'user-1',
          status: 'active' as const,
          mfaEnabled: false,
          lockedUntil: null,
          deletedAt: null,
          primaryEmailVerified: false,
          backupEmailVerified: false,
          role: null,
        }),
      } as never,
    );

    await expect(command.execute({ email: 'user@example.com', startLoginRequest: 'start-request' })).resolves.toEqual({
      serverLoginState: 'state',
      loginResponse: 'response',
      credentialId: 'credential-1',
    });
    expect(opaqueInput?.registrationRecord).toBe('verifier');
    expect(opaqueInput?.userIdentifier).toBe('opaque-user-1');
  });

  it('uses the same public OPAQUE response shape when the account does not exist', async () => {
    const command = new StartPasswordLoginCommand(
      {
        startLogin: async (input: { registrationRecord: string | null }) => ({
          serverLoginState: input.registrationRecord === null ? 'state' : 'unexpected',
          loginResponse: 'response',
        }),
      } as never,
      { findByEmail: async () => null } as never,
      { findByUserId: async () => null } as never,
      { getAuthenticationView: async () => null } as never,
    );

    await expect(
      command.execute({ email: 'missing@example.com', startLoginRequest: 'start-request' }),
    ).resolves.toEqual({
      serverLoginState: 'state',
      loginResponse: 'response',
      credentialId: null,
    });
  });

  it('finishes valid OPAQUE proof for an unverified primary email and requests verification without issuing a session', async () => {
    const calls: string[] = [];
    const command = new CompletePasswordLoginCommand(
      { finishLogin: async () => ({ sessionKey: 'session-key' }) } as never,
      { findByEmail: async () => ({ userId: 'user-1', email: 'user@example.com' }) } as never,
      {
        findByUserId: async () => ({
          credentialId: 'credential-1',
          opaqueUserIdentifier: 'opaque-user-1',
          verifier: 'verifier',
          lockedUntil: null,
        }),
        resetFailedAttempts: async () => calls.push('reset-failures'),
      } as never,
      {
        execute: async () => {
          calls.push('authenticated-login');

          return { sessionSecret: 'must-not-exist' };
        },
      } as never,
      {
        execute: async () => {
          calls.push('failed-attempt');
        },
      } as never,
      {
        execute: async () => {
          calls.push('verification-email');
        },
      } as never,
      {
        getAuthenticationView: async () => ({
          userId: 'user-1',
          status: 'active' as const,
          mfaEnabled: false,
          lockedUntil: null,
          deletedAt: null,
          primaryEmailVerified: false,
          backupEmailVerified: false,
          role: null,
        }),
      } as never,
    );

    await expect(
      command.execute({
        email: 'user@example.com',
        serverLoginState: 'state',
        finishLoginRequest: 'finish',
      }),
    ).resolves.toEqual({ emailVerificationRequested: true });
    expect(calls).toEqual(['reset-failures', 'verification-email']);
  });

  it('finishes the synthetic OPAQUE state before consulting identity on an invalid login', async () => {
    const calls: string[] = [];
    const command = new CompletePasswordLoginCommand(
      {
        finishLogin: async () => {
          calls.push('opaque-finish');

          throw new Error('invalid proof');
        },
      } as never,
      {
        findByEmail: async () => {
          calls.push('identity-lookup');

          return null;
        },
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      command.execute({ email: 'missing@example.com', serverLoginState: 'synthetic', finishLoginRequest: 'finish' }),
    ).rejects.toMatchObject({ message: 'AUTH_INVALID_CREDENTIAL' });
    expect(calls).toEqual(['opaque-finish', 'identity-lookup']);
  });

  it('does not emit a magic link event for an unverified primary email', async () => {
    let eventCalls = 0;
    const command = new StartMagicLinkLoginCommand(
      {} as never,
      { findVerifiedPrimaryEmailAccount: async () => null } as never,
      {
        emitAsync: async () => {
          eventCalls += 1;
        },
      } as never,
    );

    await expect(command.execute({ email: 'user@example.com' })).resolves.toEqual({ acknowledged: true });
    expect(eventCalls).toBe(0);
  });
});
