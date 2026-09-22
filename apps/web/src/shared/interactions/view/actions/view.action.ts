import {
  $authSessionScope,
  getSessionScope,
  isAuthenticatedSessionScope,
  isCurrentSessionScope,
} from "@/features/auth/public/session.ts";
import { ViewApi } from "@/shared/interactions/view/api/view.api.ts";

async function record(resourceId: string, options?: { signal?: AbortSignal }) {
  return ViewApi.record(resourceId, options);
}

export function recordView(resourceId: string) {
  const currentScope = getSessionScope();
  if (isAuthenticatedSessionScope(currentScope.accountId)) {
    return record(resourceId, { signal: currentScope.signal });
  }
  if (typeof window === "undefined") return null;

  return new Promise<Awaited<ReturnType<typeof record>> | null>((resolve) => {
    let settled = false;
    let attempted = false;
    let unsubscribeScope = () => {};
    const finish = (result: Awaited<ReturnType<typeof record>> | null) => {
      if (settled) return;
      settled = true;
      unsubscribeScope();
      window.clearTimeout(timeout);
      resolve(result);
    };
    const timeout = window.setTimeout(() => finish(null), 1500);
    const attempt = () => {
      if (attempted) return;
      const scope = getSessionScope();
      if (isAuthenticatedSessionScope(scope.accountId)) {
        attempted = true;
        void record(resourceId, { signal: scope.signal }).then((result) =>
          isCurrentSessionScope(scope) ? finish(result) : finish(null),
        );
      } else if (
        scope.status === "anonymous" ||
        scope.status === "invalidating" ||
        scope.status === "unavailable"
      ) {
        finish(null);
      }
    };
    unsubscribeScope = $authSessionScope.listen(attempt);
    attempt();
  });
}
