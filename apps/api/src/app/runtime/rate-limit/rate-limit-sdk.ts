import { createRequire } from 'node:module';

type ThrottlerRedisModule = typeof import('@nest-lab/throttler-storage-redis');

const loadModule = createRequire(import.meta.url);

export function loadThrottlerRedisStorage(): ThrottlerRedisModule {
  return loadModule('@nest-lab/throttler-storage-redis') as ThrottlerRedisModule;
}
