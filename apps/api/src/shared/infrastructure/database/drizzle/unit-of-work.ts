import { AsyncLocalStorage } from 'node:async_hooks';
import { Inject, Injectable } from '@nestjs/common';
import { UnitOfWork } from '@/shared/kernel/services/unit-of-work';
import type { DrizzleDatabaseService } from './db';

export type DrizzleTransaction = Parameters<Parameters<DrizzleDatabaseService['$primary']['transaction']>[0]>[0];

/**
 * Request-local transaction context. AsyncLocalStorage is only propagation
 * inside the current invocation; correctness never depends on it surviving a
 * serverless invocation boundary.
 */
@Injectable()
export class DrizzleUnitOfWork implements UnitOfWork {
  private readonly storage = new AsyncLocalStorage<DrizzleTransaction>();

  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  get current(): DrizzleTransaction | null {
    return this.storage.getStore() ?? null;
  }

  async run<T>(work: () => Promise<T>): Promise<T> {
    if (this.current) return work();

    return this.db.$primary.transaction(async (tx) => this.storage.run(tx, work));
  }
}
