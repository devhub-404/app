import assert from 'node:assert/strict';
import { test } from 'vitest';
import { clearAccount, setAccountDetails, setAccountShell } from '../../../src/features/account/store/account.store.ts';
import type { AccountDetailsView } from '../../../src/features/account/types/account-details-view.type.ts';
import { getClientActor } from '../../../src/features/auth/access/client-actor.access.ts';
import {
  setAnonymousSession,
  setAuthenticatedSession,
  setAuthUnavailable,
} from '../../../src/features/auth/store/auth.store.ts';

const session = {
  id: 'session-1',
  userId: 'account-1',
  authMethod: 'password' as const,
  lastProofOfPossessionAt: '2026-09-22T10:00:00.000Z',
  createdAt: '2026-09-22T09:00:00.000Z',
  expiresAt: '2026-10-22T09:00:00.000Z',
};

test('client actor refuses a stale account after logout', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });

  try {
    setAccountDetails({ account: { id: 'account-1' }, role: 'admin' } as AccountDetailsView);
    setAuthenticatedSession(session);
    assert.equal(getClientActor()?.accountId, 'account-1');
    assert.equal(getClientActor()?.role, 'admin');

    setAnonymousSession();
    assert.equal(getClientActor()?.accountId, null);
    assert.equal(getClientActor()?.role, null);
  } finally {
    clearAccount();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else delete (globalThis as { window?: unknown }).window;
  }
});

test('client actor refuses shell permissions while session resolution is unavailable', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });

  try {
    setAccountShell({
      account: { id: 'account-2', status: 'active' },
      profile: { username: 'person', displayName: 'Person', avatarUrl: null },
      preferences: { locale: null },
      role: 'admin',
    });
    setAuthUnavailable();

    assert.equal(getClientActor()?.accountId, null);
    assert.equal(getClientActor()?.role, null);
  } finally {
    clearAccount();
    setAnonymousSession();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else delete (globalThis as { window?: unknown }).window;
  }
});
