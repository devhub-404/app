import { PlatformApi } from '@/features/platform/api/platform.api.ts';
import { readApiData } from '@/shared/api';
import type { HealthStatus, ReadinessStatus } from '@/features/platform/types/platform.type.ts';

export async function getPlatformStatus() {
  const [healthResult, readinessResult] = await Promise.all([PlatformApi.health(), PlatformApi.readiness()]);
  const health = readApiData<HealthStatus>(healthResult.data) ?? null;
  const readiness = readApiData<ReadinessStatus>(readinessResult.data) ?? null;
  return {
    health,
    readiness,
    error: healthResult.error ?? readinessResult.error ?? null,
  };
}
