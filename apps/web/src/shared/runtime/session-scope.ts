import { atom } from 'nanostores';

export type SessionScopeStatus =
  'unknown' | 'resolving' | 'anonymous' | 'authenticated' | 'unavailable' | 'invalidating';

export type SessionScopeState = {
  status: SessionScopeStatus;
  accountId: string | null;
  revision: number;
};

export type SessionScope = SessionScopeState & {
  signal: AbortSignal;
};

const initialState: SessionScopeState = {
  status: 'unknown',
  accountId: null,
  revision: 0,
};

export const $sessionScope = atom<SessionScopeState>(initialState);

let controller: AbortController | undefined;

function getController(): AbortController {
  controller ??= new AbortController();
  return controller;
}

function rotate(status: SessionScopeStatus, accountId: string | null) {
  getController().abort();
  controller = new AbortController();

  const current = $sessionScope.get();
  $sessionScope.set({
    status,
    accountId,
    revision: current.revision + 1,
  });
}

export function beginSessionResolution() {
  const current = $sessionScope.get();
  if (current.status === 'resolving' && current.accountId === null) return;
  rotate('resolving', null);
}

/**
 * Seeds the document-wide session scope before client:load islands start
 * private requests. A deferred public-page resolution starts in the browser;
 * this is intentionally a no-op after the first document seed.
 */
export function initializeSessionScope(
  resolution: 'authenticated' | 'unauthenticated' | 'unavailable' | 'deferred',
  accountId: string | null = null,
) {
  if ($sessionScope.get().status !== 'unknown') return;
  if (resolution === 'authenticated' && accountId) {
    setAuthenticatedSessionScope(accountId);
    return;
  }
  if (resolution === 'unavailable') {
    setUnavailableSessionScope();
    return;
  }
  if (resolution === 'deferred') {
    beginSessionResolution();
    return;
  }
  setAnonymousSessionScope();
}

export function setAuthenticatedSessionScope(accountId: string) {
  const current = $sessionScope.get();
  if (current.status === 'authenticated' && current.accountId === accountId) return;
  rotate('authenticated', accountId);
}

export function setAnonymousSessionScope() {
  const current = $sessionScope.get();
  if (current.status === 'anonymous' && current.accountId === null) return;
  rotate('anonymous', null);
}

export function setUnavailableSessionScope() {
  const current = $sessionScope.get();
  if (current.status === 'unavailable' && current.accountId === null) return;
  rotate('unavailable', null);
}

export function invalidateSessionScope() {
  const current = $sessionScope.get();
  if (current.status === 'invalidating' && current.accountId === null) return;
  rotate('invalidating', null);
}

export function getSessionScope(): SessionScope {
  return { ...$sessionScope.get(), signal: getController().signal };
}

export function isCurrentSessionScope(scope: Pick<SessionScope, 'accountId' | 'revision'>): boolean {
  const current = $sessionScope.get();
  return (
    current.revision === scope.revision && current.accountId === scope.accountId && !getController().signal.aborted
  );
}

export function isAuthenticatedSessionScope(accountId?: string | null): boolean {
  const current = $sessionScope.get();
  return (
    current.status === 'authenticated' &&
    current.accountId !== null &&
    (accountId === undefined || current.accountId === accountId) &&
    !getController().signal.aborted
  );
}
