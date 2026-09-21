import Redis from 'ioredis';
import { sql } from 'drizzle-orm';
import { env } from '@/app/config/env';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';

const PROBE_TIMEOUT_MS = 1_000;

export async function probeDatabase(database: DrizzleDatabaseService): Promise<void> {
  await database.execute(sql`select 1`);
}

export async function probeRedis(): Promise<void> {
  const redis = new Redis(env.rateLimitRedisUrl, {
    lazyConnect: true,
    connectTimeout: PROBE_TIMEOUT_MS,
    commandTimeout: PROBE_TIMEOUT_MS,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false,
  });

  try {
    await redis.connect();
    await redis.ping();
  } finally {
    redis.disconnect();
  }
}

export async function probeObjectStorage(): Promise<void> {
  // Production uses Cloudflare R2. The local HTTP health endpoint is specific
  // to the MinIO adapter used by development and start.
  if (env.appEnv === 'production') return;

  const endpoint = new URL('/minio/health/live', env.cf.r2.api);
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Object storage healthcheck returned ${response.status}`);
  }
}
