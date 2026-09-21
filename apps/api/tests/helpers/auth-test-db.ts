import type { Pool } from 'pg';

/**
 * Test-only cleanup for Auth-owned rows that intentionally do not use physical
 * cross-module foreign keys back to Account. Keep E2E cases isolated/repeatable.
 */
export async function cleanupAuthUser(pool: Pool, userId: string): Promise<void> {
  await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM mfa_recovery_code WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM mfa_totp WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM credential WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM accounts WHERE id = $1', [userId]);
}
