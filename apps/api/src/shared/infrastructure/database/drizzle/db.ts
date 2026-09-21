import { drizzle } from 'drizzle-orm/node-postgres';
import { withReplicas } from 'drizzle-orm/pg-core';
import { upstashCache } from 'drizzle-orm/cache/upstash';

export type DrizzleDatabaseConfig = {
  primaryUrl: string;
  readUrl: string;
  authCache?: {
    url: string;
    token: string;
    ttlSeconds: number;
  };
};

export function createDrizzleDatabase(config: DrizzleDatabaseConfig) {
  const cache = config.authCache
    ? upstashCache({
        url: config.authCache.url,
        token: config.authCache.token,
        config: { ex: config.authCache.ttlSeconds },
      })
    : undefined;

  const primary = drizzle({
    connection: config.primaryUrl,
    ...(cache ? { cache } : {}),
  });

  const readConfig = {
    connection: config.readUrl,
    ...(cache ? { cache } : {}),
  };
  const read = drizzle(readConfig);

  return withReplicas(primary, [read]);
}

export type DrizzleDatabaseService = ReturnType<typeof createDrizzleDatabase>;
