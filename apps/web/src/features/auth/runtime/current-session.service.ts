import { getCurrentSession } from '@/features/auth/api/session.api.ts';
import { setCurrentSession, clearCurrentSession } from '@/features/auth/store/current-session';
import { isAbortError } from '@/shared/runtime/abort-signal';
import { readApiData } from '@/shared/api';
import type { components } from '@devhub-404/api-contract';

export async function refreshCurrentSession(options?: { signal?: AbortSignal }) {
  try {
    const result = await getCurrentSession(options);
    if (result.error) return null;
    const session = readApiData<components['schemas']['SessionDTO']>(result.data) ?? null;
    setCurrentSession(session);
    return session;
  } catch (error) {
    if (isAbortError(error)) return null;
    throw error;
  }
}

export { clearCurrentSession };
