import { describe, expect, it, vi } from 'vitest';
import { CompleteMagicLinkLoginCommand } from '@/modules/auth/application/magic-link/use-cases/command/complete-magic-link-login.command';
import { PreparePasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/prepare-password-recovery.command';
import { StartPasskeyLoginCommand } from '@/modules/auth/application/passkeys/use-cases/command/start-passkey-login.command';
import { StartPasswordChangeCommand } from '@/modules/auth/application/password/use-cases/command/start-password-change.command';
import { StartPasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/start-password-recovery.command';

describe('Auth primary-login and password-recovery surfaces', () => {
  it('AUTH-BE-UC-008 — magic-link completion verifies and consumes the single-use proof before authentication and preserves its signed redirect', async () => {
    const order: string[] = [];
    const payload = { email: 'user@example.com', redirect: '/account/security', jti: 'magic-1' };
    const flow = {
      verifySingleUse: vi.fn(async () => {
        order.push('verify');

        return payload;
      }),
      consumeSingleUse: vi.fn(async () => {
        order.push('consume');

        return true;
      }),
    };
    const account = { findVerifiedPrimaryEmailAccount: vi.fn(async () => ({ userId: 'user-1' })) };
    const authenticated = {
      execute: vi.fn(async () => {
        order.push('authenticate');

        return { mfaRequired: true as const, token: 'mfa-token', methods: ['totp'] };
      }),
    };
    const command = new CompleteMagicLinkLoginCommand(flow as never, account as never, authenticated as never);

    await expect(
      command.execute({ token: 'magic-token', ipAddress: '127.0.0.1', userAgent: 'browser' }),
    ).resolves.toEqual({
      mfaRequired: true,
      token: 'mfa-token',
      methods: ['totp'],
      redirect: '/account/security',
    });
    expect(order).toEqual(['verify', 'consume', 'authenticate']);
    expect(authenticated.execute).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', email: payload.email, authMethod: 'magic_link' }),
    );
  });

  it('AUTH-BE-UC-008 — magic-link replay or a token not bound to a verified primary email never reaches session/MFA issuance', async () => {
    const authenticate = vi.fn();
    const payload = { email: 'user@example.com', redirect: null, jti: 'magic-1' };
    const account = { findVerifiedPrimaryEmailAccount: vi.fn(async () => null) };
    const flow = { verifySingleUse: vi.fn(async () => payload), consumeSingleUse: vi.fn(async () => true) };
    const command = new CompleteMagicLinkLoginCommand(
      flow as never,
      account as never,
      { execute: authenticate } as never,
    );
    await expect(command.execute({ token: 'token' })).rejects.toMatchObject({ code: 'AUTH_INVALID_CREDENTIAL' });
    expect(flow.consumeSingleUse).not.toHaveBeenCalled();
    expect(authenticate).not.toHaveBeenCalled();

    account.findVerifiedPrimaryEmailAccount.mockResolvedValue({ userId: 'user-1' } as never);
    flow.consumeSingleUse.mockResolvedValue(false);
    await expect(command.execute({ token: 'token' })).rejects.toMatchObject({ code: 'AUTH_TOKEN_INVALID' });
    expect(authenticate).not.toHaveBeenCalled();
  });

  it('AUTH-BE-UC-033 — password-recovery preparation validates a live single-use reset proof and reuses the stable OPAQUE credential identifier without consuming it', async () => {
    const payload = { sub: 'user-1', email: 'user@example.com', jti: 'reset-1' };
    const flow = { verifySingleUse: vi.fn(async () => payload), consumeSingleUse: vi.fn() };
    const account = {
      getAuthenticationView: vi.fn(async () => ({
        userId: 'user-1',
        status: 'active',
        mfaEnabled: false,
        lockedUntil: null,
        deletedAt: null,
      })),
    };
    const credential = {
      findByUserId: vi.fn(async () => ({ credentialId: 'password-1', opaqueUserIdentifier: 'opaque-stable-1' })),
    };
    const opaque = {
      createRegistrationResponse: vi.fn(async () => ({ registrationResponse: 'opaque-registration-response' })),
    };
    const command = new PreparePasswordRecoveryCommand(
      flow as never,
      opaque as never,
      credential as never,
      account as never,
    );

    await expect(command.execute({ token: 'reset-token', registrationRequest: 'registration-request' })).resolves.toEqual({
      registrationResponse: 'opaque-registration-response',
    });
    expect(flow.verifySingleUse).toHaveBeenCalledWith(expect.any(Function), 'reset-token', 'password_reset');
    expect(opaque.createRegistrationResponse).toHaveBeenCalledWith({
      userIdentifier: 'opaque-stable-1',
      registrationRequest: 'registration-request',
    });
    expect(flow.consumeSingleUse).not.toHaveBeenCalled();
  });

  it('AUTH-BE-UC-041 — passkey login start binds generated challenge and login action into a short-lived single-use state proof', async () => {
    const passkey = {
      generateAuthenticationOptions: vi.fn(async () => ({
        challenge: 'challenge-1',
        options: { challenge: 'challenge-1', rpId: 'devhub.local' },
      })),
    };
    const flow = { signSingleUse: vi.fn(async () => 'passkey-state-token') };
    const command = new StartPasskeyLoginCommand(
      passkey as never,
      flow as never,
      { auth: { passkeyRpId: 'devhub.local' } } as never,
    );

    await expect(command.execute()).resolves.toEqual({
      options: { challenge: 'challenge-1', rpId: 'devhub.local' },
      stateToken: 'passkey-state-token',
    });
    expect(passkey.generateAuthenticationOptions).toHaveBeenCalledWith({ rpID: 'devhub.local' });
    expect(flow.signSingleUse).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: 'passkey_state',
        payload: { action: 'login', challenge: 'challenge-1' },
        expiresIn: '10m',
      }),
    );
  });

  it('AUTH-BE-UC-042 — password change proves the current password before minting replacement authority and binds OPAQUE registration to the existing credential identity', async () => {
    const order: string[] = [];
    const proof = {
      execute: vi.fn(async () => {
        order.push('proof');

        return { accepted: true };
      }),
    };
    const credential = {
      findByUserId: vi.fn(async () => {
        order.push('credential');

        return { opaqueUserIdentifier: 'opaque-stable-1' };
      }),
    };
    const flow = {
      signSingleUse: vi.fn(async () => {
        order.push('token');

        return 'password-change-token';
      }),
    };
    const opaque = {
      createRegistrationResponse: vi.fn(async () => {
        order.push('opaque');

        return { registrationResponse: 'registration-response' };
      }),
    };
    const command = new StartPasswordChangeCommand(flow as never, proof as never, opaque as never, credential as never);

    await expect(
      command.execute({
        userId: 'user-1',
        sessionId: 'session-1',
        serverLoginState: 'login-state',
        finishLoginRequest: 'login-finish',
        registrationRequest: 'register-start',
      }),
    ).resolves.toEqual({
      changeToken: 'password-change-token',
      registrationResponse: 'registration-response',
    });
    expect(proof.execute).toHaveBeenCalledWith(
      'user-1',
      'session-1',
      expect.objectContaining({ requireCurrentPassword: true, requiredAssurance: 'current' }),
    );
    expect(opaque.createRegistrationResponse).toHaveBeenCalledWith({
      userIdentifier: 'opaque-stable-1',
      registrationRequest: 'register-start',
    });
    expect(order[0]).toBe('proof');
  });

  it('AUTH-BE-UC-044 — password recovery is anti-enumerating and sends a reset proof only for an eligible verified Account that actually has a password credential', async () => {
    const account = {
      findVerifiedPrimaryEmailAccount: vi.fn(async () => ({ userId: 'user-1' })),
      getAuthenticationView: vi.fn(async () => ({ userId: 'user-1', status: 'active', deletedAt: null })),
    };
    const credentials = { findByUserId: vi.fn(async () => ({ credentialId: 'password-1' })) };
    const flow = { signSingleUse: vi.fn(async () => 'reset-token') };
    const emitAsync = vi.fn(async () => []);
    const command = new StartPasswordRecoveryCommand(
      credentials as never,
      flow as never,
      { emitAsync } as never,
      account as never,
    );

    await expect(command.execute({ email: 'user@example.com' })).resolves.toEqual({ acknowledged: true });
    expect(flow.signSingleUse).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: 'password_reset',
        payload: { sub: 'user-1', email: 'user@example.com' },
        expiresIn: '15m',
      }),
    );
    expect(emitAsync).toHaveBeenCalledTimes(1);

    account.findVerifiedPrimaryEmailAccount.mockResolvedValue(null);
    await expect(command.execute({ email: 'unknown@example.com' })).resolves.toEqual({ acknowledged: true });
    account.findVerifiedPrimaryEmailAccount.mockResolvedValue({ userId: 'user-1' });
    account.getAuthenticationView.mockResolvedValue({ userId: 'user-1', status: 'banned', deletedAt: null });
    await expect(command.execute({ email: 'banned@example.com' })).resolves.toEqual({ acknowledged: true });
    account.getAuthenticationView.mockResolvedValue({ userId: 'user-1', status: 'active', deletedAt: null });
    credentials.findByUserId.mockResolvedValue(null);
    await expect(command.execute({ email: 'oauth-only@example.com' })).resolves.toEqual({ acknowledged: true });
    expect(flow.signSingleUse).toHaveBeenCalledTimes(1);
    expect(emitAsync).toHaveBeenCalledTimes(1);
  });
});
