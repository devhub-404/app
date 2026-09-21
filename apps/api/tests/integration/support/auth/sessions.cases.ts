import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { getTestDatabaseUrl } from '@test/helpers/test-database';
import { cleanupAuthUser } from '../../../helpers/auth-test-db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getSharedAuthApp } from './shared-app';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { DeactivateAccountCommand } from '@/modules/account/application/account/use-cases/command/deactivate-account.command';
import { RequestAccountDeletionCommand } from '@/modules/account/application/account/use-cases/command/request-account-deletion.command';
import { SuspendAccountCommand } from '@/modules/account/application/admin/use-cases/command/suspend-account.command';
import { BanAccountCommand } from '@/modules/account/application/admin/use-cases/command/ban-account.command';
import { browserMutationHeaders } from '@test/helpers/browser-request';

describe('Session cookie and revoke HTTP contract', () => {
  let app: NestFastifyApplication;
  const pool = new Pool({ connectionString: getTestDatabaseUrl() });

  beforeAll(async () => {
    app = await getSharedAuthApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('accepts a valid session cookie and rejects it after the session is revoked', async () => {
    const userId = randomUUID();
    const emailId = randomUUID();
    const email = `sessions-e2e-${randomUUID()}@example.com`;

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

      const revokeResponse = await request(app.getHttpServer())
        .delete('/api/v1/sessions/current')
        .set(browserMutationHeaders())
        .set('Cookie', `devhub_session=${issued.sessionSecret}`);
      expect(revokeResponse.body.code).toBe('CURRENT_SESSION_REVOKED');
      const clearedCookie = revokeResponse.headers['set-cookie']?.find((value) => value.startsWith('devhub_session='));
      expect(clearedCookie).toEqual(expect.any(String));
      expect(clearedCookie).toContain('HttpOnly');
      expect(clearedCookie).toContain('Secure');
      expect(clearedCookie).toContain('SameSite=Lax');
      expect(clearedCookie).toContain('Path=/');
      expect(clearedCookie).not.toMatch(/(?:^|;)\s*Domain=/i);

      const revokedSessionResponse = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set('Cookie', `devhub_session=${issued.sessionSecret}`);
      expect(revokedSessionResponse.status).toBe(401);
    } finally {
      await cleanupAuthUser(pool, userId);
    }
  });

  it.each([
    ['deactivation', DeactivateAccountCommand],
    ['suspension', SuspendAccountCommand],
    ['ban', BanAccountCommand],
    ['deletion request', RequestAccountDeletionCommand],
  ] as const)(
    'AUTH-RN-011: %s revokes already-issued Sessions and makes their session credential unusable',
    async (_label, Command) => {
      const userId = randomUUID();
      const emailId = randomUUID();
      const email = `session-revoke-${randomUUID()}@example.com`;

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

      try {
        const issued = await app.get(IssueSessionCommand).execute({
          userId,
          authMethod: 'password',
          ipAddress: null,
          userAgent: 'eligibility-transition-contract',
        });
        const before = await pool.query(
          'SELECT id, revoked_at FROM sessions WHERE user_id = $1 AND revoked_at IS NULL',
          [userId],
        );
        expect(before.rowCount).toBe(1);

        await app.get(Command).execute(userId);

        let revokedAt: unknown = null;
        for (let attempt = 0; attempt < 20; attempt += 1) {
          const row = await pool.query('SELECT revoked_at FROM sessions WHERE id = $1', [before.rows[0].id]);
          revokedAt = row.rows[0]?.revoked_at ?? null;
          if (revokedAt !== null) break;
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        expect(revokedAt).not.toBeNull();

        const sessionAfterTransition = await request(app.getHttpServer())
          .get('/api/v1/me')
          .set('Cookie', `devhub_session=${issued.sessionSecret}`);
        expect(sessionAfterTransition.status).toBe(401);
      } finally {
        await cleanupAuthUser(pool, userId);
      }
    },
  );
});
