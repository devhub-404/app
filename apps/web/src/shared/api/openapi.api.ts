import createClient from 'openapi-fetch';
import type { Client, ClientOptions } from 'openapi-fetch';
import type { paths } from '@devhub-404/api-contract';
import { baseURL } from '@/shared/api/base-url.api.ts';
import { combineAbortSignals } from '@/shared/runtime/abort-signal';
import { getRouteScope } from '@/shared/runtime/route-scope';

const openApiBaseUrl = baseURL.replace(/\/api\/?$/, '');

/** Public, stateless API client. Authentication policy belongs to features/auth. */
export type ApiClient = Client<paths>;

export function createApiClient(options: ClientOptions = {}): ApiClient {
  return createClient<paths>(options);
}

export const publicClient = createApiClient({ baseUrl: openApiBaseUrl });

/**
 * Browser public requests belong to the current route. A navigation must not
 * leave a local listing/detail request alive after its owner has disappeared.
 * SSR clients use their own request-scoped transport and are intentionally
 * not coupled to this browser controller.
 */
publicClient.use({
  onRequest({ request }) {
    if (typeof window === 'undefined') return request;
    return new Request(request, { signal: combineAbortSignals(request.signal, getRouteScope().signal) });
  },
});
