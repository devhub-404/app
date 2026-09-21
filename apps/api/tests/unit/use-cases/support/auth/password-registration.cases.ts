import { describe, expect, it } from 'vitest';
import { StartPasswordRegistrationCommand } from '@/modules/auth/application/password/use-cases/command/start-password-registration.command';
import { CompletePasswordRegistrationCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-registration.command';
import { StartPasswordCredentialCreationCommand } from '@/modules/auth/application/password/use-cases/command/start-password-credential-creation.command';
import { CompletePasswordCredentialCreationCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-credential-creation.command';

const account = {
  getAuthenticationView: async (userId: string) => ({
    userId,
    status: 'active' as const,
    mfaEnabled: false,
    lockedUntil: null,
  }),
};

describe('Password registration contract commands', () => {
  it('starts public password registration with the protocol request', async () => {
    let received: string | undefined;
    const command = new StartPasswordRegistrationCommand({
      createRegistrationResponse: async (input: { userIdentifier: string; registrationRequest: string }) => {
        received = `${input.userIdentifier}:${input.registrationRequest}`;

        return { registrationResponse: 'registration-response' };
      },
    } as never);

    const result = await command.execute({ email: 'user@example.com', registrationRequest: 'registration-request' });
    expect(result.registrationResponse).toBe('registration-response');
    expect(result.opaqueUserIdentifier).toMatch(/^[0-9a-f-]+$/);
    expect(received).toBe(`${result.opaqueUserIdentifier}:registration-request`);
  });

  it('does not query account existence during the public OPAQUE registration start', async () => {
    let opaqueCalled = false;
    const command = new StartPasswordRegistrationCommand({
      createRegistrationResponse: async () => {
        opaqueCalled = true;

        return { registrationResponse: 'registration-response' };
      },
    } as never);

    await expect(
      command.execute({ email: 'user@example.com', registrationRequest: 'registration-request' }),
    ).resolves.toMatchObject({ registrationResponse: 'registration-response' });
    expect(opaqueCalled).toBe(true);
  });

  it('creates account, primary email and password credential without issuing a session', async () => {
    const calls: string[] = [];
    const command = new CompletePasswordRegistrationCommand(
      {
        getServerPublicKey: async (record: string) => {
          calls.push(`validate:${record}`);

          return {};
        },
      } as never,
      {
        findByEmail: async () => null,
        create: async (input: { email?: string | null; emailVerifiedAt?: Date | null }) => {
          const verifiedAt = input.emailVerifiedAt === null ? 'null' : (input.emailVerifiedAt?.toISOString() ?? '');
          calls.push(`account:${input.email}:${verifiedAt}`);

          return 'user-1';
        },
      } as never,
      {
        createPassword: async (input: { userId: string; verifier: string; opaqueUserIdentifier: string }) => {
          calls.push(`credential:${input.userId}:password:${input.opaqueUserIdentifier}`);
          calls.push(`verifier:credential-1:${input.verifier}`);

          return { id: 'credential-1' };
        },
      } as never,
      {
        run: async <T>(work: () => Promise<T>) => {
          calls.push('uow:start');
          const result = await work();
          calls.push('uow:commit');

          return result;
        },
      },
      { execute: async (userId: string) => calls.push(`verify-email:${userId}`) } as never,
      { emit: (_event: string, event: { userId: string }) => calls.push(`event:${event.userId}`) } as never,
    );

    await expect(
      command.execute({
        email: 'user@example.com',
        registrationRecord: 'record-1',
        opaqueUserIdentifier: 'opaque-user-1',
      }),
    ).resolves.toEqual({ acknowledged: true });
    expect(calls).toEqual([
      'validate:record-1',
      'uow:start',
      'account:user@example.com:null',
      'credential:user-1:password:opaque-user-1',
      'verifier:credential-1:record-1',
      'uow:commit',
      'event:user-1',
      'verify-email:user-1',
    ]);
  });

  it('does not emit post-commit effects when the initial credential cannot be provisioned', async () => {
    let eventEmitted = false;
    let verificationStarted = false;
    const command = new CompletePasswordRegistrationCommand(
      { getServerPublicKey: async () => ({}) } as never,
      {
        findByEmail: async () => null,
        create: async () => 'user-1',
      } as never,
      {
        createPassword: async () => {
          throw new Error('credential failed');
        },
      } as never,
      { run: async <T>(work: () => Promise<T>) => work() },
      {
        execute: async () => {
          verificationStarted = true;
        },
      } as never,
      {
        emit: () => {
          eventEmitted = true;
        },
      } as never,
    );

    await expect(
      command.execute({
        email: 'user@example.com',
        registrationRecord: 'record',
        opaqueUserIdentifier: 'opaque-user-1',
      }),
    ).rejects.toThrow('credential failed');
    expect(eventEmitted).toBe(false);
    expect(verificationStarted).toBe(false);
  });

  it('does not create an account when the registration record is invalid', async () => {
    let created = false;
    const command = new CompletePasswordRegistrationCommand(
      {
        getServerPublicKey: async () => {
          throw new Error('invalid registration');
        },
      } as never,
      {
        findByEmail: async () => null,
        create: async () => {
          created = true;

          return 'user-1';
        },
      } as never,
      {} as never,
      { run: async <T>(work: () => Promise<T>) => work() },
      {} as never,
      {} as never,
    );

    await expect(
      command.execute({
        email: 'user@example.com',
        registrationRecord: 'invalid',
        opaqueUserIdentifier: 'opaque-user-1',
      }),
    ).rejects.toThrow('invalid registration');
    expect(created).toBe(false);
  });

  it('rejects a disposable email before creating an identity', async () => {
    let queried = false;
    const command = new CompletePasswordRegistrationCommand(
      {} as never,
      {
        findByEmail: async () => {
          queried = true;

          return null;
        },
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      command.execute({
        email: 'person@mailinator.com',
        registrationRecord: 'record',
        opaqueUserIdentifier: 'opaque-user-1',
      }),
    ).rejects.toThrow('DISPOSABLE_EMAIL_NOT_ALLOWED');
    expect(queried).toBe(false);
  });
});

describe('Password credential creation contract commands', () => {
  it('starts authenticated password credential creation after possession proof', async () => {
    const calls: string[] = [];
    const command = new StartPasswordCredentialCreationCommand(
      {
        createRegistrationResponse: async (input: { userIdentifier: string; registrationRequest: string }) => {
          calls.push(`opaque:${input.userIdentifier}:${input.registrationRequest}`);

          return { registrationResponse: 'response' };
        },
      } as never,
      { findByUserId: async () => null } as never,
      { execute: async (userId: string, sessionId: string) => calls.push(`proof:${userId}:${sessionId}`) } as never,
      account as never,
    );

    const result = await command.execute({ userId: 'user-1', sessionId: 'session-1', registrationRequest: 'request-1' });
    expect(result.registrationResponse).toBe('response');
    expect(result.opaqueUserIdentifier).toMatch(/^[0-9a-f-]+$/);
    expect(calls[0]).toBe('proof:user-1:session-1');
    expect(calls[1]).toMatch(/^opaque:[0-9a-f-]+:request-1$/);
  });

  it('creates the password credential only after proof and protocol validation', async () => {
    const calls: string[] = [];
    const command = new CompletePasswordCredentialCreationCommand(
      {
        getServerPublicKey: async (record: string) => {
          calls.push(`validate:${record}`);

          return {};
        },
      } as never,
      {
        createPassword: async (input: { userId: string; verifier: string; opaqueUserIdentifier: string }) => {
          calls.push(`credential:${input.userId}:password:${input.opaqueUserIdentifier}`);

          return { id: 'credential-1' };
        },
      } as never,
      { findByUserId: async () => null } as never,
      { execute: async (userId: string, sessionId: string) => calls.push(`proof:${userId}:${sessionId}`) } as never,
      account as never,
    );

    await expect(command.execute({ userId: 'user-1', sessionId: 'session-1', registrationRecord: 'record-1', opaqueUserIdentifier: 'opaque-user-1' })).resolves.toEqual({
      credentialId: 'credential-1',
    });
    expect(calls).toEqual(['proof:user-1:session-1', 'validate:record-1', 'credential:user-1:password:opaque-user-1']);
  });

  it('does not create a second password credential', async () => {
    let created = false;
    const command = new CompletePasswordCredentialCreationCommand(
      {} as never,
      {
        createPassword: async () => {
          created = true;

          return { id: 'credential-2' };
        },
      } as never,
      {
        findByUserId: async () => ({
          credentialId: 'credential-1',
          opaqueUserIdentifier: 'opaque-user-1',
          verifier: 'record-1',
        }),
      } as never,
      {} as never,
      { execute: async () => undefined } as never,
      account,
    );

    await expect(command.execute('user-1', 'session-1', 'record-2', 'opaque-user-1')).rejects.toThrow();
    expect(created).toBe(false);
  });
});
