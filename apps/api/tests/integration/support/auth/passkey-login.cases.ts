import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { getTestDatabaseUrl } from '@test/helpers/test-database';
import { cleanupAuthUser } from '../../../helpers/auth-test-db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getSharedAuthApp } from './shared-app';
import { PasskeyService } from '@/modules/auth/domain/services/passkey.service';

describe('Passkey login HTTP contract', () => {
  let app: NestFastifyApplication;
  const pool = new Pool({ connectionString: getTestDatabaseUrl() });

  beforeAll(async () => {
    app = await getSharedAuthApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('starts a WebAuthn authentication challenge', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/login/passkey/start').send({});
    expect(response.body.code).toBe('PASSKEY_LOGIN_STARTED');
    expect(response.body.data.stateToken).toEqual(expect.any(String));
    expect(response.body.data.options.challenge).toEqual(expect.any(String));
  });

  it('rejects a passkey assertion for an unknown credential', async () => {
    const startResponse = await request(app.getHttpServer()).post('/api/v1/login/passkey/start').send({});
    const response = await request(app.getHttpServer())
      .post('/api/v1/login/passkey/complete')
      .send({
        stateToken: startResponse.body.data.stateToken,
        response: { id: `unknown-${randomUUID()}` },
      });
    expect(response.body.code).toBe('AUTH_INVALID_CREDENTIAL');
  });

  it('completes passkey login with a verified credential and advances its counter', async () => {
    const userId = randomUUID();
    const emailId = randomUUID();
    const credentialId = randomUUID();
    const email = `passkey-e2e-${randomUUID()}@example.com`;
    const webauthnId = `webauthn-${randomUUID()}`;

    await pool.query(
      `INSERT INTO accounts (id, voluntary_status, moderation_status, deletion_status, mfa_enabled) VALUES ($1, 'active', 'none', 'none', false)`,
      [userId],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at) VALUES ($1, $2, $3, 'primary', now())`,
      [emailId, userId, email],
    );
    await pool.query(`INSERT INTO credential (id, user_id, type) VALUES ($1, $2, 'passkey')`, [credentialId, userId]);
    await pool.query(
      `INSERT INTO credential_passkey (id, webauthn_id, public_key, counter, device_type, backed_up)
       VALUES ($1, $2, $3, 0, 'single_device', false)`,
      [credentialId, webauthnId, Buffer.from('test-public-key').toString('base64')],
    );

    const passkeyService = app.get(PasskeyService);
    const originalVerify = passkeyService.verifyAuthenticationResponse.bind(passkeyService);
    passkeyService.verifyAuthenticationResponse = async () => ({ verified: true, newCounter: 1 });

    try {
      const startResponse = await request(app.getHttpServer()).post('/api/v1/login/passkey/start').send({});
      const response = await request(app.getHttpServer())
        .post('/api/v1/login/passkey/complete')
        .send({
          stateToken: startResponse.body.data.stateToken,
          response: { id: webauthnId },
        });
      expect(response.body.code).toBe('PASSKEY_LOGIN_COMPLETED');
      expect(response.body.data.sessionSecret).toBeUndefined();
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('devhub_session=')]),
      );
      const counter = await pool.query(`SELECT counter FROM credential_passkey WHERE id = $1`, [credentialId]);
      expect(counter.rows[0]?.counter).toBe(1);
    } finally {
      passkeyService.verifyAuthenticationResponse = originalVerify;
      await cleanupAuthUser(pool, userId);
    }
  });
});
