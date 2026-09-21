import { env } from '@/app/config/env';
import { createDrizzleDatabase } from '@/shared/infrastructure/database/drizzle/db';

export const DrizzleDatabase = createDrizzleDatabase({
  primaryUrl: env.databaseUrl,
  readUrl: env.readDatabaseUrl,
  ...(env.authCacheRedisUrl && env.authCacheRedisToken
    ? {
        authCache: {
          url: env.authCacheRedisUrl,
          token: env.authCacheRedisToken,
          ttlSeconds: env.authCacheTtlSeconds,
        },
      }
    : {}),
});
