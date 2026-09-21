import { describe, expect, it, vi } from 'vitest';
import { GetHealthStatusQuery } from '@/app/runtime/platform/application/use-cases/get-health-status.query';
import { GetReadinessStatusQuery } from '@/app/runtime/platform/application/use-cases/get-readiness-status.query';

vi.mock('@/app/runtime/platform/application/readiness-probes', () => ({
  probeDatabase: vi.fn().mockResolvedValue(undefined),
  probeObjectStorage: vi.fn().mockResolvedValue(undefined),
  probeRedis: vi.fn().mockResolvedValue(undefined),
}));

// Normative source: docs/domains/platform/SPEC.md.
describe('Platform use cases', () => {
  it('PLAT-RF-001 — health proves the runtime answers without leaking dependency details', () => {
    const result = new GetHealthStatusQuery().execute({});
    expect(result.status).toBe('ok');
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    expect(Object.keys(result).sort()).toEqual(['status', 'timestamp']);
  });

  it('PLAT-RF-002 — readiness reports traffic eligibility using a bounded public shape', async () => {
    const result = await new GetReadinessStatusQuery({} as never).execute({});
    expect(result).toMatchObject({ status: 'ready', ready: true });
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    expect(Object.keys(result).sort()).toEqual(['ready', 'status', 'timestamp']);
  });
});
