import { useStore } from '@nanostores/solid';
import { createMemo } from 'solid-js';
import { $authRole } from '@/features/auth/store/auth-roles';
import { $accountSession } from '@/features/auth/store/account-session';
import { $currentSession } from '@/features/auth/store/current-session';
import { $sessionScope } from '@/shared/runtime/session-scope';

export function useAuthSession() {
  const projectedSession = useStore($accountSession);
  const scope = useStore($sessionScope);
  const session = createMemo(() => {
    const current = projectedSession();
    const currentScope = scope();
    if (current.status !== 'authenticated' || currentScope.status !== 'authenticated') {
      return { status: 'unauthenticated' as const, me: null };
    }
    return current;
  });
  const authenticated = createMemo(() => session().status === 'authenticated');
  const currentSession = useStore($currentSession);
  const role = useStore($authRole);
  return {
    session,
    authenticated,
    sessionId: createMemo(() => currentSession()?.id ?? null),
    role: createMemo(() => (authenticated() ? role() : null)),
  };
}
