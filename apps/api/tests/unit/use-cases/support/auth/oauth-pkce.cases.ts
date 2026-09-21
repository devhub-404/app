import { createHash } from 'node:crypto';
import { authConfig } from '../../../helpers/module-config';
import { describe, expect, it } from 'vitest';
import { createPkcePair } from '@/modules/auth/application/oauth/pkce';
import { StartOAuthLoginCommand } from '@/modules/auth/application/oauth/use-cases/command/start-oauth-login.command';

describe('OAuth PKCE', () => {
  it('generates an RFC 7636 S256 verifier/challenge pair', () => {
    const { codeVerifier, codeChallenge } = createPkcePair();
    expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(codeVerifier.length).toBeLessThanOrEqual(128);
    expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(codeChallenge).toBe(createHash('sha256').update(codeVerifier, 'ascii').digest('base64url'));
    expect(codeChallenge).not.toBe(codeVerifier);
  });

  it('sends S256 to the provider without placing the verifier in the signed state token', async () => {
    let signedPayload: Record<string, unknown> | undefined;
    let authorizationInput: { codeChallenge?: string; codeChallengeMethod?: string; state?: string } | undefined;
    const command = new StartOAuthLoginCommand(
      {
        get: () => ({
          getAuthorizationUrl: (input: typeof authorizationInput) => {
            authorizationInput = input;

            return 'https://provider.example/authorize';
          },
        }),
      } as never,
      {
        signSingleUse: async (input: { payload: Record<string, unknown> }) => {
          signedPayload = input.payload;

          return 'signed-state-token';
        },
      } as never,

      authConfig,
    );

    const result = await command.execute({ provider: 'github' });

    expect(signedPayload).toMatchObject({ action: 'login', provider: 'github', state: result.browserContext.state });
    expect(signedPayload).not.toHaveProperty('codeVerifier');
    expect(authorizationInput?.state).toBe('signed-state-token');
    expect(authorizationInput?.codeChallengeMethod).toBe('S256');
    expect(authorizationInput?.codeChallenge).toBe(
      createHash('sha256').update(result.browserContext.codeVerifier, 'ascii').digest('base64url'),
    );
    expect(authorizationInput?.codeChallenge).not.toBe(result.browserContext.codeVerifier);
  });
});
