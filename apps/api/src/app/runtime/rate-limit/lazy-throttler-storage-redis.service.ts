import type { ThrottlerStorage } from '@nestjs/throttler';
import { loadThrottlerRedisStorage } from './rate-limit-sdk';

type ThrottlerStorageRecord = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

type RedisStorage = ThrottlerStorage & {
  onModuleDestroy?: () => void;
};

export class LazyThrottlerStorageRedisService implements ThrottlerStorage {
  private storage: RedisStorage | undefined;

  constructor(private readonly redisUrl: string) {}

  private getStorage(): RedisStorage {
    if (!this.storage) {
      const { ThrottlerStorageRedisService } = loadThrottlerRedisStorage();
      this.storage = new ThrottlerStorageRedisService(this.redisUrl);
    }

    return this.storage;
  }

  increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    return this.getStorage().increment(key, ttl, limit, blockDuration, throttlerName);
  }

  onModuleDestroy(): void {
    this.storage?.onModuleDestroy?.();
  }
}
