import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { getTestDatabaseUrl } from '@test/helpers/test-database';
import { cleanupAuthUser } from '../../../helpers/auth-test-db';
import { client, ready, server } from '@serenity-kit/opaque';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getSharedAuthApp } from './shared-app';
import { env } from '@/app/config/env';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { generateSecret, generateSync } from 'otplib';

describe('Password login HTTP contract', () => {
  let app: NestFastifyApplication;
  const pool = new Pool({ connectionString: getTestDatabaseUrl() });

  beforeAll(async () => {
    app = await getSharedAuthApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('completes a valid password login and issues the contract session artifacts', async () => {
    await ready;

    const email = `password-e2e-${randomUUID()}@example.com`;
    const password = 'correct horse battery staple';
    const userId = randomUUID();
    const credentialId = randomUUID();
    const opaqueUserIdentifier = randomUUID();
    const emailId = randomUUID();

    const registration = client.startRegistration({ password });
    const registrationResponse = server.createRegistrationResponse({
      serverSetup: env.auth.opaqueServerSetup,
      userIdentifier: opaqueUserIdentifier,
      registrationRequest: registration.registrationRequest,
    });
    const registrationRecord = client.finishRegistration({
      password,
      registrationResponse: registrationResponse.registrationResponse,
      clientRegistrationState: registration.clientRegistrationState,
    });

    await pool.query(
      `INSERT INTO accounts (id, voluntary_status, moderation_status, deletion_status, mfa_enabled)
       VALUES ($1, 'active', 'none', 'none', false)`,
      [userId],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at)
       VALUES ($1, $2, $3, 'primary', now())`,
      [emailId, userId, email],
    );
    await pool.query(
      `INSERT INTO credential (id, user_id, type)
       VALUES ($1, $2, 'password')`,
      [credentialId, userId],
    );
    await pool.query(
      `INSERT INTO credential_password (id, verifier, opaque_user_identifier, scheme)
       VALUES ($1, $2, $3, 'OPAQUE')`,
      [credentialId, registrationRecord.registrationRecord, opaqueUserIdentifier],
    );

    try {
      const login = client.startLogin({ password });
      const startResponse = await request(app.getHttpServer())
        .post('/api/v1/login/password/start')
        .send({ email, startLoginRequest: login.startLoginRequest });

      const loginResponse = client.finishLogin({
        clientLoginState: login.clientLoginState,
        loginResponse: startResponse.body.data.loginResponse,
        password,
      });
      const finishResponse = await request(app.getHttpServer()).post('/api/v1/login/password/complete').send({
        email,
        serverLoginState: startResponse.body.data.serverLoginState,
        finishLoginRequest: loginResponse.finishLoginRequest,
      });
      expect(finishResponse.body.code).toBe('PASSWORD_LOGIN_COMPLETED');
      expect(finishResponse.body.data.sessionSecret).toBeUndefined();
      const sessionCookie = finishResponse.headers['set-cookie']?.find((value) => value.startsWith('devhub_session='));
      expect(sessionCookie).toEqual(expect.any(String));
      expect(sessionCookie).toContain('HttpOnly');
      expect(sessionCookie).toContain('Secure');
      expect(sessionCookie).toContain('SameSite=Lax');
      expect(sessionCookie).toContain('Path=/');
      expect(sessionCookie).toContain('Max-Age=2592000');
      expect(sessionCookie).not.toMatch(/(?:^|;)\s*Domain=/i);
    } finally {
      await cleanupAuthUser(pool, userId);
    }
  });

  it('keeps MFA login sessionless until the second factor succeeds and prevents challenge replay', async () => {
    await ready;

    const email = `password-mfa-e2e-${randomUUID()}@example.com`;
    const password = 'correct horse battery staple with mfa';
    const userId = randomUUID();
    const credentialId = randomUUID();
    const opaqueUserIdentifier = randomUUID();
    const emailId = randomUUID();
    const totpId = randomUUID();
    const secret = generateSecret();

    const registration = client.startRegistration({ password });
    const registrationResponse = server.createRegistrationResponse({
      serverSetup: env.auth.opaqueServerSetup,
      userIdentifier: opaqueUserIdentifier,
      registrationRequest: registration.registrationRequest,
    });
    const registrationRecord = client.finishRegistration({
      password,
      registrationResponse: registrationResponse.registrationResponse,
      clientRegistrationState: registration.clientRegistrationState,
    });
    const encryptedSecret = await app.get(TotpSecretCryptoService).encryptBase32Secret(secret);

    await pool.query(
      `INSERT INTO accounts (id, voluntary_status, moderation_status, deletion_status, mfa_enabled)
       VALUES ($1, 'active', 'none', 'none', true)`,
      [userId],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at)
       VALUES ($1, $2, $3, 'primary', now())`,
      [emailId, userId, email],
    );
    await pool.query(`INSERT INTO credential (id, user_id, type) VALUES ($1, $2, 'password')`, [credentialId, userId]);
    await pool.query(
      `INSERT INTO credential_password (id, verifier, opaque_user_identifier, scheme) VALUES ($1, $2, $3, 'OPAQUE')`,
      [credentialId, registrationRecord.registrationRecord, opaqueUserIdentifier],
    );
    await pool.query(`INSERT INTO mfa_totp (id, user_id, encrypted_secret, status) VALUES ($1, $2, $3, 'active')`, [
      totpId,
      userId,
      encryptedSecret,
    ]);

    try {
      const login = client.startLogin({ password });
      const startResponse = await request(app.getHttpServer())
        .post('/api/v1/login/password/start')
        .send({ email, startLoginRequest: login.startLoginRequest });
      const loginResponse = client.finishLogin({
        clientLoginState: login.clientLoginState,
        loginResponse: startResponse.body.data.loginResponse,
        password,
      });
      if (!loginResponse) throw new Error('OPAQUE login proof was not produced');

      const primaryResponse = await request(app.getHttpServer()).post('/api/v1/login/password/complete').send({
        email,
        serverLoginState: startResponse.body.data.serverLoginState,
        finishLoginRequest: loginResponse.finishLoginRequest,
      });

      expect(primaryResponse.body.code).toBe('PASSWORD_LOGIN_COMPLETED');
      expect(primaryResponse.body.data).toMatchObject({
        mfaRequired: true,
        token: expect.any(String),
        methods: expect.arrayContaining(['totp']),
      });
      expect(primaryResponse.headers['set-cookie']?.some((value) => value.startsWith('devhub_session=')) ?? false).toBe(
        false,
      );
      const beforeMfa = await pool.query('SELECT id FROM sessions WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
      expect(beforeMfa.rowCount).toBe(0);

      const code = generateSync({ secret });
      const mfaResponse = await request(app.getHttpServer())
        .post('/api/v1/mfa/verify/totp')
        .send({ token: primaryResponse.body.data.token, code });
      expect(mfaResponse.body.code).toBe('TOTP_VERIFIED');
      expect(mfaResponse.body.data).toBeNull();
      const sessionCookie = mfaResponse.headers['set-cookie']?.find((value) => value.startsWith('devhub_session='));
      expect(sessionCookie).toEqual(expect.any(String));

      const afterMfa = await pool.query(
        'SELECT id, auth_method FROM sessions WHERE user_id = $1 AND revoked_at IS NULL',
        [userId],
      );
      expect(afterMfa.rowCount).toBe(1);
      expect(afterMfa.rows[0]?.auth_method).toBe('password');

      const replayResponse = await request(app.getHttpServer())
        .post('/api/v1/mfa/verify/totp')
        .send({ token: primaryResponse.body.data.token, code });
      expect(replayResponse.body.code).toBe('AUTH_TOKEN_INVALID');
      const afterReplay = await pool.query('SELECT id FROM sessions WHERE user_id = $1 AND revoked_at IS NULL', [
        userId,
      ]);
      expect(afterReplay.rowCount).toBe(1);
    } finally {
      await cleanupAuthUser(pool, userId);
    }
  });

  it('does not expose an unknown account during the public OPAQUE start ceremony', async () => {
    await ready;
    const login = client.startLogin({ password: 'irrelevant synthetic password' });
    const response = await request(app.getHttpServer())
      .post('/api/v1/login/password/start')
      .send({ email: `unknown-${randomUUID()}@example.com`, startLoginRequest: login.startLoginRequest });

    expect(response.body.code).toBe('PASSWORD_LOGIN_STARTED');
    expect(response.body.data).toEqual({
      serverLoginState: expect.any(String),
      loginResponse: expect.any(String),
    });
  });
});
