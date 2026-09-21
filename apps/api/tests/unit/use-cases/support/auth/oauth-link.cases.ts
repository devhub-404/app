import { describe, expect, it } from 'vitest';
import { authConfig } from '../../../helpers/module-config';
import { StartOAuthLinkCommand } from '@/modules/auth/application/oauth/use-cases/command/start-oauth-link.command';
import { CompleteOAuthLinkCommand } from '@/modules/auth/application/oauth/use-cases/command/complete-oauth-link.command';
import { CompleteOAuthLoginCommand } from '@/modules/auth/application/oauth/use-cases/command/complete-oauth-login.command';
import { AppError } from '@/shared/errors/app-error';

const provider = {
  getAuthorizationUrl: () => 'https://provider.example/link',
  exchangeCodeForTokens: async () => ({ accessToken: 'provider-access-token' }),
  getUserProfile: async () => ({
    provider: 'github' as const,
    providerUserId: 'provider-user-1',
    email: 'oauth@example.com',
    emailVerified: true,
    displayName: 'OAuth User',
    avatarUrl: '',
  }),
};

describe('OAuth link contract commands', () => {
  it('requires possession proof before starting an OAuth link', async () => {
    let providerCalls = 0;
    const command = new StartOAuthLinkCommand(
      {
        get: () => {
          providerCalls += 1;

          return provider;
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

    await expect(command.execute({ userId: 'user-1', sessionId: 'session-1', provider: 'github' })).rejects.toThrow('possession proof required');
    expect(providerCalls).toBe(0);
  });

  it('starts an OAuth link after possession proof', async () => {
    let providerState: string | undefined;
    const command = new StartOAuthLinkCommand(
      {
        get: () => ({
          ...provider,
          getAuthorizationUrl: (input: { state: string }) => {
            providerState = input.state;

            return 'https://provider.example/link';
          },
        }),
      } as never,
      {
        signSingleUse: async (input: { payload: unknown }) => {
          expect(input.payload).toMatchObject({ action: 'link', provider: 'github', userId: 'user-1' });

          return 'signed-state-token';
        },
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    const result = await command.execute({ userId: 'user-1', sessionId: 'session-1', provider: 'github' });
    expect(result).toMatchObject({
      url: 'https://provider.example/link',
      stateToken: 'signed-state-token',
      browserContext: { state: expect.any(String), codeVerifier: expect.any(String) },
    });
    expect(providerState).toBe('signed-state-token');
  });

  it('persists an OAuth credential only after possession proof and provider authorization', async () => {
    const created: unknown[] = [];
    const command = new CompleteOAuthLinkCommand(
      { get: () => provider } as never,
      {
        verifySingleUse: async () => ({ state: 'browser-state', action: 'link', provider: 'github', userId: 'user-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        findByProviderAndUserId: async () => null,
      } as never,
      {
        createOAuth: async (input: unknown) => {
          created.push(input);

          return { id: 'credential-1' };
        },
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    await expect(
      command.execute('github', {
        userId: 'user-1',
        sessionId: 'session-1',
        code: 'provider-code',
        stateToken: 'state-token',
        browserState: 'browser-state',
        codeVerifier: 'verifier-1',
      }),
    ).resolves.toEqual({ credentialId: 'credential-1' });

    expect(created).toEqual([{ userId: 'user-1', provider: 'github', providerUserId: 'provider-user-1' }]);
  });

  it('does not link an OAuth identity already owned by another user', async () => {
    let credentialCalls = 0;
    const command = new CompleteOAuthLinkCommand(
      { get: () => provider } as never,
      {
        verifySingleUse: async () => ({ state: 'browser-state', action: 'link', provider: 'github', userId: 'user-1' }),
        consumeSingleUse: async () => true,
      } as never,
      {
        findByProviderAndUserId: async () => ({
          credentialId: 'credential-existing',
          userId: 'other-user',
          provider: 'github' as const,
          providerUserId: 'provider-user-1',
        }),
        create: async () => undefined,
      },
      {
        create: async () => {
          credentialCalls += 1;

          return { id: 'credential-1' };
        },
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    await expect(
      command.execute('github', {
        userId: 'user-1',
        sessionId: 'session-1',
        code: 'provider-code',
        stateToken: 'state-token',
        browserState: 'browser-state',
        codeVerifier: 'verifier-1',
      }),
    ).rejects.toThrow();
    expect(credentialCalls).toBe(0);
  });

  it('rejects OAuth link state issued to a different account before contacting the provider', async () => {
    let providerCalls = 0;
    let credentialCalls = 0;
    const command = new CompleteOAuthLinkCommand(
      {
        get: () => {
          providerCalls += 1;

          return provider;
        },
      } as never,
      {
        verifySingleUse: async () => ({ state: 'browser-state', action: 'link', provider: 'github', userId: 'user-2' }),
        consumeSingleUse: async () => true,
      } as never,
      {} as never,
      {
        createOAuth: async () => {
          credentialCalls += 1;

          return { id: 'credential-1' };
        },
      } as never,
      { execute: async () => ({ accepted: true }) } as never,

      authConfig,
    );

    await expect(
      command.execute('github', {
        userId: 'user-1',
        sessionId: 'session-1',
        code: 'provider-code',
        stateToken: 'state-token',
        browserState: 'browser-state',
        codeVerifier: 'verifier-1',
      }),
    ).rejects.toThrow();
    expect(providerCalls).toBe(0);
    expect(credentialCalls).toBe(0);
  });
});

describe('OAuth login contract commands', () => {
  it('rejects a signed OAuth state that is not bound to the browser PKCE context', async () => {
    let providerCalls = 0;
    const command = new CompleteOAuthLoginCommand(
      {
        get: () => {
          providerCalls += 1;

          return provider;
        },
      } as never,
      {
        verifySingleUse: async () => ({ state: 'signed-state', action: 'login', provider: 'github' }),
        consumeSingleUse: async () => true,
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,

      authConfig,
    );

    await expect(
      command.execute('github', {
        code: 'provider-code',
        stateToken: 'state-token',
        browserState: 'different-browser-state',
        codeVerifier: 'verifier',
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toThrowError(new AppError('AUTH_TOKEN_INVALID'));
    expect(providerCalls).toBe(0);
  });

  it('provisions a new OAuth Account through the Account owner before creating the credential', async () => {
    const effects: string[] = [];
    const command = new CompleteOAuthLoginCommand(
      { get: () => provider } as never,
      {
        verifySingleUse: async () => ({ state: 'browser-state', action: 'login', provider: 'github' }),
        consumeSingleUse: async () => true,
      } as never,
      { findByProviderAndUserId: async () => null } as never,
      {
        createOAuth: async (input: { userId: string; provider: string; providerUserId: string }) => {
          effects.push(`credential:${input.userId}:${input.provider}:${input.providerUserId}`);

          return { id: 'credential-1' };
        },
        updateLastUsedAt: async (credentialId: string) => effects.push(`last-used:${credentialId}`),
      } as never,
      {
        findByEmail: async () => null,
        create: async (input: { email?: string | null; emailVerifiedAt?: Date | null }) => {
          effects.push(`account:${input.email}:${input.emailVerifiedAt instanceof Date}`);

          return 'user-new';
        },
      } as never,
      {
        setVerifiedAt: async () => {
          throw new Error('new-account OAuth must not mutate an existing email');
        },
      } as never,
      {
        run: async <T>(work: () => Promise<T>) => {
          effects.push('uow:start');
          const result = await work();
          effects.push('uow:commit');

          return result;
        },
      },
      {
        execute: async (input: { userId: string; authMethod: string }) => {
          effects.push(`session:${input.userId}:${input.authMethod}`);

          return { sessionSecret: 'session-secret' };
        },
      } as never,
      { emit: (_name: string, event: { userId: string }) => effects.push(`event:${event.userId}`) } as never,
      {} as never,

      authConfig,
    );

    await expect(
      command.execute('github', {
        code: 'provider-code',
        stateToken: 'state-token',
        browserState: 'browser-state',
        codeVerifier: 'verifier',
        ipAddress: null,
        userAgent: null,
      }),
    ).resolves.toEqual({ sessionSecret: 'session-secret' });

    expect(effects).toEqual([
      'uow:start',
      'account:oauth@example.com:true',
      'credential:user-new:github:provider-user-1',
      'uow:commit',
      'event:user-new',
      'last-used:credential-1',
      'session:user-new:oauth',
    ]);
  });

  it('rejects OAuth email auto-association when the provider has not verified the address', async () => {
    const effects: string[] = [];
    const unverifiedProvider = {
      exchangeCodeForTokens: async () => ({ accessToken: 'provider-access-token' }),
      getUserProfile: async () => ({
        provider: 'github' as const,
        providerUserId: 'provider-user-1',
        email: 'oauth@example.com',
        emailVerified: false,
        displayName: 'OAuth User',
        avatarUrl: '',
      }),
    };
    const command = new CompleteOAuthLoginCommand(
      { get: () => unverifiedProvider } as never,
      {
        verifySingleUse: async () => ({ state: 'browser-state', action: 'login', provider: 'github' }),
        consumeSingleUse: async () => true,
      } as never,
      { findByProviderAndUserId: async () => null } as never,
      {
        createOAuth: async () => {
          effects.push('credential');

          return { id: 'credential-1' };
        },
        updateLastUsedAt: async () => effects.push('last-used'),
      } as never,
      { findByEmail: async () => ({ userId: 'user-1' }) } as never,
      { setVerifiedAt: async () => effects.push('local-email-verified') } as never,
      {} as never,
      { execute: async () => ({ sessionSecret: 'session-secret' }) } as never,
      { emit: () => undefined } as never,
      {} as never,
      authConfig,
    );

    await expect(
      command.execute('github', {
        code: 'provider-code',
        stateToken: 'state-token',
        browserState: 'browser-state',
        codeVerifier: 'verifier',
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toMatchObject({ message: 'AUTH_INVALID_CREDENTIAL' });
    expect(effects).toEqual([]);
  });
});
