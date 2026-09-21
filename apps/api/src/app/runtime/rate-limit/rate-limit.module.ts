import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { env } from '@/app/config/env';
import { RATE_LIMIT_POLICIES } from './rate-limit.policies';
import { GlobalRateLimitGuard, LocalRateLimitGuard } from './rate-limit.guards';
import { LazyThrottlerStorageRedisService } from './lazy-throttler-storage-redis.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      // The factory must create one Redis client per Nest application. A
      // module-level storage instance would be disconnected when any app
      // shuts down and leave other app instances with a dead client.
      useFactory: () => ({
        throttlers: [
          { name: 'global', ...RATE_LIMIT_POLICIES.global },
          { name: 'local', ...RATE_LIMIT_POLICIES.local },
        ],
        // Keep the local runtime on the same distributed storage path as
        // production. The local Redis URL is supplied through the environment.
        storage: new LazyThrottlerStorageRedisService(env.rateLimitRedisUrl),
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: GlobalRateLimitGuard }, LocalRateLimitGuard],
  exports: [ThrottlerModule, LocalRateLimitGuard],
})
export class RateLimitModule {}
