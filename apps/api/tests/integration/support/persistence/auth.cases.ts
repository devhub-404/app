import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getTestDatabaseUrl } from '@test/helpers/test-database';
import { DrizzleDatabase } from '@/app/runtime/database/drizzle-database';
import { DrizzleUnitOfWork } from '@/shared/infrastructure/database/drizzle/unit-of-work';
import { DrizzleMfaTotpRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/mfa-totp.repository';
import { DrizzleCredentialRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/credential.repository';

export function defineAuthPersistenceCases() {
  describe('AUTH-RN-006/011 + AUTH-RNF-001/005 — credential/factor persistence invariants', () => {
    const pool = new Pool({ connectionString: getTestDatabaseUrl() });
    const accountA = randomUUID();
    const accountB = randomUUID();
    beforeAll(async () => {
      await pool.query('SELECT 1');
      await pool.query('INSERT INTO accounts (id) VALUES ($1),($2)', [accountA, accountB]);
    });
    afterAll(async () => {
      await pool.query('DELETE FROM mfa_totp WHERE user_id=ANY($1::uuid[])', [[accountA, accountB]]);
      await pool.query('DELETE FROM credential WHERE user_id=ANY($1::uuid[])', [[accountA, accountB]]);
      await pool.query('DELETE FROM account_emails WHERE user_id=ANY($1::uuid[])', [[accountA, accountB]]);
      await pool.query('DELETE FROM accounts WHERE id=ANY($1::uuid[])', [[accountA, accountB]]);
      await pool.end();
    });
    it('persists TOTP disablement as canonical disabled state', async () => {
      const id = randomUUID();
      await pool.query('INSERT INTO mfa_totp (id,user_id,encrypted_secret,status) VALUES ($1,$2,$3,$4)', [
        id,
        accountA,
        'encrypted-secret',
        'active',
      ]);
      await new DrizzleMfaTotpRepository(DrizzleDatabase).disableMfa(accountA);
      expect((await pool.query('SELECT status FROM mfa_totp WHERE id=$1', [id])).rows).toEqual([
        { status: 'disabled' },
      ]);
    });
    it('persists technical credential deletion without embedding primary-method policy', async () => {
      const first = randomUUID(),
        second = randomUUID();
      await pool.query(`INSERT INTO credential (id,user_id,type) VALUES ($1,$3,'passkey'),($2,$3,'oauth')`, [
        first,
        second,
        accountB,
      ]);
      const repository = new DrizzleCredentialRepository(DrizzleDatabase, new DrizzleUnitOfWork(DrizzleDatabase));
      expect(await repository.countByUserId(accountB)).toBe(2);
      await repository.deleteById(first);
      expect((await pool.query('SELECT id FROM credential WHERE user_id=$1', [accountB])).rows).toHaveLength(1);
      await repository.deleteById(second);
      expect((await pool.query('SELECT id FROM credential WHERE user_id=$1', [accountB])).rows).toHaveLength(0);
    });
    it('enforces global email uniqueness and a single primary email per Account', async () => {
      const email = `primary-${randomUUID()}@example.com`;
      await pool.query('INSERT INTO account_emails (id,user_id,email,type) VALUES ($1,$2,$3,$4)', [
        randomUUID(),
        accountA,
        email,
        'primary',
      ]);
      await expect(
        pool.query('INSERT INTO account_emails (id,user_id,email,type) VALUES ($1,$2,$3,$4)', [
          randomUUID(),
          accountB,
          email,
          'primary',
        ]),
      ).rejects.toThrow();
      await expect(
        pool.query('INSERT INTO account_emails (id,user_id,email,type) VALUES ($1,$2,$3,$4)', [
          randomUUID(),
          accountA,
          `other-${randomUUID()}@example.com`,
          'primary',
        ]),
      ).rejects.toThrow();
    });
  });
}
