import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { getTestDatabaseUrl } from '@test/helpers/test-database';
import { cleanupAuthUser } from '../../../helpers/auth-test-db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { generateSecret, generateSync } from 'otplib';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getSharedAuthApp } from './shared-app';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { MfaChallengeService } from '@/modules/auth/application/mfa/application-services/mfa-challenge.service';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import { browserMutationHeaders } from '@test/helpers/browser-request';

function refreshCookie(response: request.Response): string {
  const cookie = response.headers['set-cookie']?.find((value) => value.startsWith('devhub_session='));
  if (!cookie) throw new Error('session cookie was not issued');

  return cookie.split(';', 1)[0].slice('devhub_session='.length);
}

describe('TOTP MFA HTTP contract', () => {
  let app: NestFastifyApplication;
  const pool = new Pool({ connectionString: getTestDatabaseUrl() });

  beforeAll(async () => {
    app = await getSharedAuthApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('enrolls TOTP, activates MFA with a valid code, and disables it', async () => {
    const userId = randomUUID();
    const emailId = randomUUID();
    const email = `mfa-e2e-${randomUUID()}@example.com`;

    await pool.query(
      `INSERT INTO accounts (id, voluntary_status, moderation_status, deletion_status, mfa_enabled) VALUES ($1, 'active', 'none', 'none', false)`,
      [userId],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at)
       VALUES ($1, $2, $3, 'primary', now())`,
      [emailId, userId, email],
    );

    try {
      const issued = await app.get(IssueSessionCommand).execute({
        userId,
        authMethod: 'password',
        ipAddress: null,
        userAgent: 'contract-test',
      });
      const authorization = { ...browserMutationHeaders(), Cookie: `devhub_session=${issued.sessionSecret}` };

      const startResponse = await request(app.getHttpServer()).post('/api/v1/mfa/enroll/totp/start').set(authorization);
      expect(startResponse.body.code).toBe('TOTP_ENROLLMENT_STARTED');
      expect(startResponse.body.data.status).toBe('pending');
      expect(startResponse.body.data.secret).toEqual(expect.any(String));
      expect(startResponse.body.data.otpauthUri).toContain('otpauth://totp/');

      const code = generateSync({ secret: startResponse.body.data.secret });
      const completeResponse = await request(app.getHttpServer())
        .post('/api/v1/mfa/enroll/totp/complete')
        .set(authorization)
        .send({ code });
      expect(completeResponse.body.code).toBe('TOTP_ENROLLMENT_COMPLETED');
      expect(completeResponse.body.data.recoveryCodes).toEqual(expect.arrayContaining([expect.any(String)]));

      const userAfterEnrollment = await pool.query(`SELECT mfa_enabled FROM accounts WHERE id = $1`, [userId]);
      expect(userAfterEnrollment.rows[0]?.mfa_enabled).toBe(true);

      const refreshedAuthorization = {
        ...browserMutationHeaders(),
        Cookie: `devhub_session=${refreshCookie(completeResponse)}`,
      };
      const refreshedSecret = refreshCookie(completeResponse);
      const refreshedHash = await app.get(AuthSecretDigestService).hash(refreshedSecret);
      await pool.query(`UPDATE sessions SET expires_at = now() + interval '1 minute' WHERE session_secret_hash = $1`, [
        refreshedHash,
      ]);

      const beforeDisable = Date.now();
      const disableResponse = await request(app.getHttpServer())
        .post('/api/v1/mfa/totp/disable')
        .set(refreshedAuthorization)
        .send({ method: 'totp', code: generateSync({ secret: startResponse.body.data.secret }) });
      expect(disableResponse.body.code).toBe('TOTP_DISABLED');
      expect(refreshCookie(disableResponse)).toBe(refreshedSecret);

      const userAfterDisable = await pool.query(`SELECT mfa_enabled FROM accounts WHERE id = $1`, [userId]);
      expect(userAfterDisable.rows[0]?.mfa_enabled).toBe(false);
      const renewedSession = await pool.query(`SELECT expires_at FROM sessions WHERE session_secret_hash = $1`, [
        refreshedHash,
      ]);
      const renewedExpiry = new Date(renewedSession.rows[0]?.expires_at).getTime();
      expect(renewedExpiry).toBeGreaterThanOrEqual(beforeDisable + 30 * 24 * 60 * 60 * 1000 - 5_000);
    } finally {
      await cleanupAuthUser(pool, userId);
    }
  });

  it('requires a valid login challenge and TOTP code before issuing an MFA session', async () => {
    const userId = randomUUID();
    const emailId = randomUUID();
    const totpId = randomUUID();
    const email = `mfa-challenge-e2e-${randomUUID()}@example.com`;
    const secret = generateSecret();
    const encryptedSecret = await app.get(TotpSecretCryptoService).encryptBase32Secret(secret);

    await pool.query(
      `INSERT INTO accounts (id, voluntary_status, moderation_status, deletion_status, mfa_enabled) VALUES ($1, 'active', 'none', 'none', true)`,
      [userId],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at)
       VALUES ($1, $2, $3, 'primary', now())`,
      [emailId, userId, email],
    );
    await pool.query(
      `INSERT INTO mfa_totp (id, user_id, encrypted_secret, status)
       VALUES ($1, $2, $3, 'active')`,
      [totpId, userId, encryptedSecret],
    );

    try {
      const challenge = await app.get(MfaChallengeService).execute({ userId, authMethod: 'password' });

      const invalidResponse = await request(app.getHttpServer())
        .post('/api/v1/mfa/verify/totp')
        .send({ token: challenge.token, code: '000000' });
      expect(invalidResponse.body.code).toBe('AUTH_INVALID_CREDENTIAL');

      const validResponse = await request(app.getHttpServer())
        .post('/api/v1/mfa/verify/totp')
        .send({ token: challenge.token, code: generateSync({ secret }) });
      expect(validResponse.body.code).toBe('TOTP_VERIFIED');
      expect(validResponse.body.data).toBeNull();
      expect(refreshCookie(validResponse)).toEqual(expect.any(String));
    } finally {
      await cleanupAuthUser(pool, userId);
    }
  });

  it('consumes a recovery code exactly once', async () => {
    const userId = randomUUID();
    const emailId = randomUUID();
    const firstCodeId = randomUUID();
    const secondCodeId = randomUUID();
    const email = `mfa-recovery-e2e-${randomUUID()}@example.com`;
    const recoveryCode = `recovery-${randomUUID()}`;
    const digest = app.get(AuthSecretDigestService);

    await pool.query(
      `INSERT INTO accounts (id, voluntary_status, moderation_status, deletion_status, mfa_enabled) VALUES ($1, 'active', 'none', 'none', true)`,
      [userId],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at)
       VALUES ($1, $2, $3, 'primary', now())`,
      [emailId, userId, email],
    );
    await pool.query(
      `INSERT INTO mfa_recovery_code (id, user_id, code_hash)
       VALUES ($1, $2, $3), ($4, $2, $5)`,
      [firstCodeId, userId, await digest.hash(recoveryCode), secondCodeId, await digest.hash('other-code')],
    );

    try {
      const challenge = await app.get(MfaChallengeService).execute({ userId, authMethod: 'password' });
      const firstResponse = await request(app.getHttpServer())
        .post('/api/v1/mfa/verify/recovery-code')
        .send({ token: challenge.token, recoveryCode });
      expect(firstResponse.body.code).toBe('RECOVERY_CODE_VERIFIED');
      expect(firstResponse.body.data.recoveryCodeUsed).toBe(true);
      expect(firstResponse.body.data.remainingCodes).toEqual(expect.any(Number));

      const replayResponse = await request(app.getHttpServer())
        .post('/api/v1/mfa/verify/recovery-code')
        .send({ token: challenge.token, recoveryCode });
      expect(replayResponse.body.code).toBe('AUTH_TOKEN_INVALID');
    } finally {
      await cleanupAuthUser(pool, userId);
    }
  });
});
