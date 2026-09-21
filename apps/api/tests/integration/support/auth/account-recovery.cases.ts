import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { getTestDatabaseUrl } from '@test/helpers/test-database';
import { cleanupAuthUser } from '../../../helpers/auth-test-db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getSharedAuthApp } from './shared-app';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto/jwt-token-type';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';

describe('Account recovery HTTP contract', () => {
  let app: NestFastifyApplication;
  const pool = new Pool({ connectionString: getTestDatabaseUrl() });

  beforeAll(async () => {
    app = await getSharedAuthApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('acknowledges recovery for an unknown account without revealing existence', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/account-recovery/start')
      .send({ email: `unknown-recovery-${randomUUID()}@example.com` });
    expect(response.body.code).toBe('ACCOUNT_RECOVERY_STARTED');
    expect(response.body.data).toEqual({ acknowledged: true });
  });

  it('rejects an invalid recovery token at the public boundary', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/account-recovery/complete')
      .send({ token: 'invalid-recovery-token' });
    expect(response.body.code).toBe('AUTH_TOKEN_INVALID');
  });

  it('recovers through a verified backup email, resets MFA, and revokes sessions', async () => {
    const userId = randomUUID();
    const primaryEmailId = randomUUID();
    const backupEmailId = randomUUID();
    const backupEmail = `backup-recovery-${randomUUID()}@example.com`;
    const primaryEmail = `primary-recovery-${randomUUID()}@example.com`;

    await pool.query(
      `INSERT INTO accounts (id, voluntary_status, moderation_status, deletion_status, mfa_enabled) VALUES ($1, 'active', 'none', 'none', false)`,
      [userId],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at) VALUES ($1, $2, $3, 'primary', now())`,
      [primaryEmailId, userId, primaryEmail],
    );
    await pool.query(
      `INSERT INTO account_emails (id, user_id, email, type, verified_at) VALUES ($1, $2, $3, 'backup', now())`,
      [backupEmailId, userId, backupEmail],
    );

    try {
      const issued = await app.get(IssueSessionCommand).execute({ userId, authMethod: 'password' });
      await pool.query('UPDATE accounts SET mfa_enabled = true WHERE id = $1', [userId]);
      await pool.query(`INSERT INTO mfa_totp (id, user_id, encrypted_secret, status) VALUES ($1, $2, $3, 'active')`, [
        randomUUID(),
        userId,
        'encrypted-secret',
      ]);
      const token = await app.get(FlowTokenService).signSingleUse({
        type: JwtTokenType.ACCOUNT_RECOVERY,
        payload: { sub: userId, email: backupEmail },
        expiresIn: '15m',
        purpose: 'account_recovery',
        subjectId: userId,
      });

      const response = await request(app.getHttpServer()).post('/api/v1/account-recovery/complete').send({ token });
      expect(response.body.code).toBe('ACCOUNT_RECOVERED');
      expect(response.body.data).toEqual({ recovered: true });
      expect(
        (await pool.query(`SELECT revoked_at FROM sessions WHERE user_id = $1 LIMIT 1`, [userId])).rows[0]?.revoked_at,
      ).not.toBeNull();
      expect(
        (await pool.query(`SELECT email FROM account_emails WHERE user_id = $1 AND type = 'primary'`, [userId])).rows,
      ).toEqual([{ email: primaryEmail }]);
      expect((await pool.query(`SELECT mfa_enabled FROM accounts WHERE id = $1`, [userId])).rows[0].mfa_enabled).toBe(
        false,
      );
      expect(
        (await pool.query(`SELECT COUNT(*)::int AS count FROM mfa_totp WHERE user_id = $1`, [userId])).rows[0].count,
      ).toBe(0);
      expect(issued.sessionSecret).toEqual(expect.any(String));
    } finally {
      await cleanupAuthUser(pool, userId);
    }
  });
});
