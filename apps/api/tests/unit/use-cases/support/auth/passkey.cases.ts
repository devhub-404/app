import { describe, expect, it } from 'vitest';
import { authConfig } from '../../../helpers/module-config';
import { StartPasskeyRegistrationCommand } from '@/modules/auth/application/passkeys/use-cases/command/start-passkey-registration.command';
import { CompletePasskeyRegistrationCommand } from '@/modules/auth/application/passkeys/use-cases/command/complete-passkey-registration.command';
import { CompletePasskeyLoginCommand } from '@/modules/auth/application/passkeys/use-cases/command/complete-passkey-login.command';
import { UpdatePasskeyDeviceNameCommand } from '@/modules/auth/application/passkeys/use-cases/command/update-passkey-device-name.command';

function user() {
  return {
    id: 'user-1',
    status: 'active',
    mfaEnabled: false,
    lockedUntil: null,
    deletedAt: null,
  };
}

describe('Passkey registration contract commands', () => {
  it('updates the device name only for an owned passkey credential', async () => {
    const updates: string[] = [];
    const command = new UpdatePasskeyDeviceNameCommand(
      {
        updateDeviceName: async (credentialId: string, deviceName: string) =>
          updates.push(`${credentialId}:${deviceName}`),
      } as never,
      { findById: async () => ({ id: 'credential-1', userId: 'user-1', type: 'passkey' }) } as never,
    );

    await command.execute('user-1', 'credential-1', 'Work laptop');

    expect(updates).toEqual(['credential-1:Work laptop']);
  });

  it('rejects renaming a credential that belongs to another user', async () => {
    let updates = 0;
    const command = new UpdatePasskeyDeviceNameCommand(
      {
        updateDeviceName: async () => {
          updates += 1;
        },
      } as never,
      { findById: async () => ({ id: 'credential-1', userId: 'other-user', type: 'passkey' }) } as never,
    );

    await expect(command.execute('user-1', 'credential-1', 'Work laptop')).rejects.toThrow();
    expect(updates).toBe(0);
  });

  it('rejects renaming a non-passkey credential through the passkey endpoint', async () => {
    let updates = 0;
    const command = new UpdatePasskeyDeviceNameCommand(
      {
        updateDeviceName: async () => {
          updates += 1;
        },
      } as never,
      { findById: async () => ({ id: 'credential-1', userId: 'user-1', type: 'password' }) } as never,
    );

    await expect(command.execute('user-1', 'credential-1', 'Work laptop')).rejects.toThrow();
    expect(updates).toBe(0);
  });

  it('requires possession proof before starting registration', async () => {
    let lookupCalls = 0;
    const command = new StartPasskeyRegistrationCommand(
      {} as never,
      {} as never,
      {
        listWebauthnIdsByUserId: async () => {
          lookupCalls += 1;

          return [];
        },
      } as never,
      {} as never,
      {
        execute: async () => {
          throw new Error('possession proof required');
        },
      } as never,

      authConfig,
    );

    await expect(command.execute('user-1', 'session-1')).rejects.toThrow('possession proof required');
    expect(lookupCalls).toBe(0);
  });

  it('requires a verified primary email before starting registration', async () => {
    let optionCalls = 0;
    const command = new StartPasskeyRegistrationCommand(
      {
        generateRegistrationOptions: async () => {
          optionCalls += 1;

          return {};
        },
      } as never,
      {} as never,
      { listWebauthnIdsByUserId: async () => [] } as never,
      {
        findById: async () => user(),
        findPrimaryEmailByUserId: async () => ({ email: 'user@example.com', verifiedAt: null }),
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    await expect(command.execute('user-1', 'session-1')).rejects.toThrow();
    expect(optionCalls).toBe(0);
  });

  it('starts registration for an authenticated user with a verified primary email', async () => {
    const command = new StartPasskeyRegistrationCommand(
      {
        generateRegistrationOptions: async (input: { excludeCredentialIDs: string[] }) => ({
          challenge: 'challenge-1',
          options: { challenge: 'challenge-1' },
          excluded: input.excludeCredentialIDs,
        }),
      } as never,
      { signSingleUse: async () => 'state-token' } as never,
      { listWebauthnIdsByUserId: async () => ['existing-webauthn-id'] } as never,
      {
        findById: async () => user(),
        findPrimaryEmailByUserId: async () => ({ email: 'user@example.com', verifiedAt: new Date() }),
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    const result = await command.execute('user-1', 'session-1');

    expect(result).toMatchObject({ stateToken: 'state-token' });
    expect(result.options).toMatchObject({ challenge: 'challenge-1' });
  });

  it('persists a verified passkey registration after possession proof', async () => {
    const created: unknown[] = [];
    const command = new CompletePasskeyRegistrationCommand(
      {
        verifyRegistrationResponse: async () => ({
          verified: true,
          registration: {
            webauthnId: 'webauthn-1',
            publicKey: 'public-key',
            counter: 0,
            deviceType: 'single_device',
            backedUp: false,
            transports: ['internal'],
          },
        }),
      } as never,
      {
        verifySingleUse: async () => ({ action: 'register', challenge: 'challenge-1', userId: 'user-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        createPasskey: async (input: unknown) => {
          created.push(input);

          return { id: 'credential-1' };
        },
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    await expect(
      command.execute({
        userId: 'user-1',
        sessionId: 'session-1',
        stateToken: 'state-token',
        response: { id: 'webauthn-1' },
        deviceName: 'Laptop',
      }),
    ).resolves.toEqual({ credentialId: 'credential-1' });

    expect(created).toEqual([
      expect.objectContaining({
        userId: 'user-1',
        webauthnId: 'webauthn-1',
        counter: 0,
        deviceName: 'Laptop',
      }),
    ]);
  });

  it('does not persist an unverified passkey registration', async () => {
    let credentialCalls = 0;
    const command = new CompletePasskeyRegistrationCommand(
      { verifyRegistrationResponse: async () => ({ verified: false }) } as never,
      {
        verifySingleUse: async () => ({ action: 'register', challenge: 'challenge-1', userId: 'user-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        createPasskey: async () => {
          credentialCalls += 1;

          return { id: 'credential-1' };
        },
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    await expect(
      command.execute({
        userId: 'user-1',
        sessionId: 'session-1',
        stateToken: 'state-token',
        response: { id: 'webauthn-1' },
      }),
    ).rejects.toThrow();
    expect(credentialCalls).toBe(0);
  });

  it('does not let possession proof for one account consume a registration state issued to another', async () => {
    let credentialCalls = 0;
    const command = new CompletePasskeyRegistrationCommand(
      {} as never,
      {
        verifySingleUse: async () => ({ action: 'register', challenge: 'challenge-1', userId: 'user-2' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        createPasskey: async () => {
          credentialCalls += 1;

          return { id: 'credential-1' };
        },
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    await expect(
      command.execute({
        userId: 'user-1',
        sessionId: 'session-1',
        stateToken: 'state-for-user-2',
        response: {},
      }),
    ).rejects.toThrow();
    expect(credentialCalls).toBe(0);
  });

  it('persists a higher passkey counter after successful authentication', async () => {
    const updates: number[] = [];
    const command = new CompletePasskeyLoginCommand(
      { verifyAuthenticationResponse: async () => ({ verified: true, newCounter: 6 }) } as never,
      {
        verifySingleUse: async () => ({ action: 'login', challenge: 'challenge-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        findByWebauthnId: async () => ({
          credentialId: 'credential-1',
          userId: 'user-1',
          webauthnId: 'webauthn-1',
          publicKey: Buffer.from('public-key').toString('base64'),
          counter: 5,
          deviceType: 'single_device',
          backedUp: false,
          transports: null,
          deviceName: null,
        }),
        updateCounter: async (_id: string, counter: number) => updates.push(counter),
      } as never,
      { updateLastUsedAt: async () => undefined } as never,
      { findPrimaryEmailByUserId: async () => ({ email: 'user@example.com' }) } as never,
      { execute: async () => ({ sessionSecret: 'session-secret' }) } as never,
      {
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
      } as never,

      authConfig,
    );

    await command.execute({ stateToken: 'state-token', response: { id: 'webauthn-1' } });

    expect(updates).toEqual([6]);
  });

  it('never decreases a passkey counter after successful authentication', async () => {
    const updates: number[] = [];
    const command = new CompletePasskeyLoginCommand(
      { verifyAuthenticationResponse: async () => ({ verified: true, newCounter: 4 }) } as never,
      {
        verifySingleUse: async () => ({ action: 'login', challenge: 'challenge-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        findByWebauthnId: async () => ({
          credentialId: 'credential-1',
          userId: 'user-1',
          webauthnId: 'webauthn-1',
          publicKey: Buffer.from('public-key').toString('base64'),
          counter: 5,
          deviceType: 'single_device',
          backedUp: false,
          transports: null,
          deviceName: null,
        }),
        updateCounter: async (_id: string, counter: number) => updates.push(counter),
      } as never,
      { updateLastUsedAt: async () => undefined } as never,
      { findPrimaryEmailByUserId: async () => ({ email: 'user@example.com' }) } as never,
      { execute: async () => ({ sessionSecret: 'session-secret' }) } as never,
      {
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
      } as never,

      authConfig,
    );

    await command.execute({ stateToken: 'state-token', response: { id: 'webauthn-1' } });

    expect(updates).toEqual([]);
  });
});
