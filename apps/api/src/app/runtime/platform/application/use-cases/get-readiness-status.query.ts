import { Inject, Injectable } from '@nestjs/common';
import type { GetReadinessStatusInputDTO } from '@/app/runtime/platform/application/dtos/in';
import { ReadinessStatusDTO } from '@/app/runtime/platform/application/dtos/out';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { probeDatabase, probeObjectStorage, probeRedis } from '../readiness-probes';

const PROBE_TIMEOUT_MS = 1_500;

async function boundedProbe(probe: Promise<void>): Promise<void> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      probe,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Readiness probe timed out')), PROBE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

@Injectable()
export class GetReadinessStatusQuery {
  constructor(@Inject('DATABASE') private readonly database: DrizzleDatabaseService) {}

  async execute(_input: GetReadinessStatusInputDTO): Promise<ReadinessStatusDTO> {
    const checks = await Promise.allSettled([
      boundedProbe(probeDatabase(this.database)),
      boundedProbe(probeRedis()),
      boundedProbe(probeObjectStorage()),
    ]);
    const ready = checks.every((check) => check.status === 'fulfilled');

    return {
      status: ready ? 'ready' : 'not_ready',
      ready,
      timestamp: new Date().toISOString(),
    };
  }
}
