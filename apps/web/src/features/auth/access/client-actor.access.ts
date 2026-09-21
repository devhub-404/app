import { $account } from '../../account/public/client-state.ts';
import { getSessionScope } from '../../../shared/runtime/session-scope.ts';
import { anonymousActor, type Actor } from './actor.access.ts';

/**
 * Reads the server-derived actor projection for browser-side operation guards.
 * SSR calls are allowed through because their route/middleware and backend
 * remain authoritative and the browser Account store is not hydrated there.
 */
export function getClientActor(): Actor | null {
  if (typeof window === 'undefined') return null;
  const account = $account.get();
  const accountId = account.details?.account.id ?? account.shell?.account.id;
  if (!accountId) return anonymousActor;
  const scope = getSessionScope();
  if (scope.status !== 'authenticated' || scope.accountId !== accountId) return anonymousActor;
  return {
    accountId,
    role: account.details?.role ?? account.shell?.role ?? null,
    organizationIds: [],
    ownerOrganizationIds: [],
  };
}

export function isClientAccessAllowed(predicate: (actor: Actor) => boolean): boolean {
  const actor = getClientActor();
  return actor === null || predicate(actor);
}
