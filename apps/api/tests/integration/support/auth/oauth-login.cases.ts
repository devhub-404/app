import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { getTestDatabaseUrl } from '@test/helpers/test-database';
import { cleanupAuthUser } from '../../../helpers/auth-test-db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getSharedAuthApp } from './shared-app';
import { OAuthProviderFactory } from '@/modules/auth/domain/services/oauth-provider.factory';

describe('OAuth login HTTP contract', () => {
  let app: NestFastifyApplication;
  const pool = new Pool({ connectionString: getTestDatabaseUrl() });

  beforeAll(async () => {
    app = await getSharedAuthApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('starts the OAuth authorization flow with state', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/oauth/github/login/start').send({});
    expect(response.body.code).toBe('OAUTH_LOGIN_STARTED');
    expect(response.body.data.stateToken).toEqual(expect.any(String));
    expect(response.body.data.url).toMatch(/^https:\/\//);
    expect(new URL(response.body.data.url).searchParams.get('state')).toBe(response.body.data.stateToken);
  });

  it('rejects an invalid OAuth callback state without leaking an internal error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/oauth/github/login/complete')
      .send({ code: 'provider-code', stateToken: 'invalid-state-token' });
    expect(response.body.code).toBe('AUTH_TOKEN_INVALID');
  });

  it('completes OAuth login through a deterministic provider double', async () => {
    const email = `oauth-e2e-${randomUUID()}@example.com`;
    const provider = {
      name: 'github' as const,
      getAuthorizationUrl: () => 'https://provider.example/authorize',
      exchangeCodeForTokens: async () => ({
        accessToken: 'provider-access-token',
        refreshToken: 'provider-refresh-token',
        tokenType: 'Bearer' as const,
      }),
      getUserProfile: async () => ({
        provider: 'github' as const,
        providerUserId: `provider-user-${randomUUID()}`,
        email,
        emailVerified: true,
        displayName: 'OAuth E2E User',
        avatarUrl: 'https://provider.example/avatar.png',
      }),
    };
    const factory = app.get(OAuthProviderFactory);
    const originalGet = factory.get.bind(factory);
    factory.get = () => provider;

    try {
      const agent = request.agent(app.getHttpServer());
      const started = await agent.post('/api/v1/oauth/github/login/start').send({});
      const stateToken = started.body.data.stateToken as string;
      expect(started.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('oauth_login_github_context=')]),
      );
      const browserContextCookie = started.headers['set-cookie']
        ?.find((value) => value.startsWith('oauth_login_github_context='))
        ?.split(';', 1)[0];
      expect(browserContextCookie).toEqual(expect.any(String));

      const response = await agent
        .post('/api/v1/oauth/github/login/complete')
        .set('Cookie', browserContextCookie)
        .send({ code: 'provider-code', stateToken });
      expect(response.body.code).toBe('OAUTH_LOGIN_COMPLETED');
      expect(response.body.data.sessionSecret).toBeUndefined();
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('devhub_session=')]),
      );

      const user = await pool.query(
        `SELECT id FROM accounts WHERE id IN (SELECT user_id FROM account_emails WHERE email = $1)`,
        [email],
      );
      expect(user.rowCount).toBe(1);
      await cleanupAuthUser(pool, user.rows[0].id);
    } finally {
      factory.get = originalGet;
    }
  });
});
