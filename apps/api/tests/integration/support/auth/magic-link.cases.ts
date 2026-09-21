import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { getTestDatabaseUrl } from '@test/helpers/test-database';
import { cleanupAuthUser } from '../../../helpers/auth-test-db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getSharedAuthApp } from './shared-app';
import { ACCOUNT_SERVICE, type AccountServicePort } from '@/modules/account/public/account.service.port';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto/jwt-token-type';

describe('Magic link login HTTP contract', () => {
  let app: NestFastifyApplication;
  const pool = new Pool({ connectionString: getTestDatabaseUrl() });

  beforeAll(async () => {
    app = await getSharedAuthApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('acknowledges unknown accounts without revealing account existence', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/login/magic-link/start')
      .send({ email: `unknown-${randomUUID()}@example.com` });
    expect(response.body.code).toBe('MAGIC_LINK_LOGIN_STARTED');
    expect(response.body.data).toEqual({ acknowledged: true });
  });

  it('requests and completes a magic link only for a verified primary email', async () => {
    const email = `magic-link-e2e-${randomUUID()}@example.com`;
    const userId = randomUUID();
    const emailId = randomUUID();

    await pool.query(
      `INSERT INTO accounts (id, voluntary_status, moderation_status, deletion_status, mfa_enabled) VALUES ($1, 'active', 'none', 'none', false)`,
      [userId],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at)
       VALUES ($1, $2, $3, 'primary', now())`,
      [emailId, userId, email],
    );
    const seeded = await pool.query(
      `SELECT u.id FROM accounts u
       INNER JOIN account_emails e ON e.user_id = u.id
       WHERE e.email = $1 AND e.type = 'primary' AND e.verified_at IS NOT NULL AND u.deletion_status = 'none'`,
      [email],
    );
    expect(seeded.rowCount).toBe(1);
    expect(await app.get<AccountServicePort>(ACCOUNT_SERVICE).findVerifiedPrimaryEmailAccount(email)).toEqual({
      userId,
      email,
    });

    try {
      const startResponse = await request(app.getHttpServer())
        .post('/api/v1/login/magic-link/start')
        .send({ email, redirect: '/dashboard' });
      expect(startResponse.body.code).toBe('MAGIC_LINK_LOGIN_STARTED');
      expect(startResponse.body.data).toEqual({ acknowledged: true });
      // The start contract intentionally returns only a public acknowledgement.
      // The token is delivered by the email event; create its equivalent here to
      // exercise the public completion boundary without SMTP.
      const token = await app.get(FlowTokenService).signSingleUse({
        type: JwtTokenType.MAGIC_LINK,
        payload: { email, redirect: '/dashboard' },
        expiresIn: '10m',
        purpose: 'magic_link',
        subjectId: null,
      });

      const completeResponse = await request(app.getHttpServer())
        .post('/api/v1/login/magic-link/complete')
        .send({ token });
      expect(completeResponse.body.code).toBe('MAGIC_LINK_LOGIN_COMPLETED');
      expect(completeResponse.body.data.sessionSecret).toBeUndefined();
      expect(completeResponse.body.data.redirect).toBe('/dashboard');
      expect(completeResponse.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('devhub_session=')]),
      );
    } finally {
      await cleanupAuthUser(pool, userId);
    }
  });
});
