import { performance } from 'node:perf_hooks';
import { Logger } from '@nestjs/common';

type BootstrapTimingPhase = {
  name: string;
  durationMs: number;
  elapsedMs: number;
};

function roundMilliseconds(value: number): number {
  return Math.round(value * 100) / 100;
}

export class BootstrapTiming {
  private readonly startedAt = performance.now();
  private lastCheckpointAt = this.startedAt;
  private readonly phases: BootstrapTimingPhase[] = [];

  constructor(private readonly enabled: boolean) {}

  checkpoint(name: string): void {
    if (!this.enabled) return;

    const now = performance.now();
    this.phases.push({
      name,
      durationMs: roundMilliseconds(now - this.lastCheckpointAt),
      elapsedMs: roundMilliseconds(now - this.startedAt),
    });
    this.lastCheckpointAt = now;
  }

  async measure<T>(name: string, operation: () => Promise<T>): Promise<T> {
    if (!this.enabled) return await operation();

    const startedAt = performance.now();
    try {
      return await operation();
    } finally {
      const now = performance.now();
      this.phases.push({
        name,
        durationMs: roundMilliseconds(now - startedAt),
        elapsedMs: roundMilliseconds(now - this.startedAt),
      });
      this.lastCheckpointAt = now;
    }
  }

  log(): void {
    if (!this.enabled) return;

    const totalMs = roundMilliseconds(performance.now() - this.startedAt);
    new Logger('BootstrapTiming').log(JSON.stringify({ totalMs, phases: this.phases }));
  }
}
