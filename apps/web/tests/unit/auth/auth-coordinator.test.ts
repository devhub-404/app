import assert from "node:assert/strict";
import { test } from "vitest";
import {
  createAuthCoordinator,
  type AuthSessionGateway,
} from "../../../src/features/auth/runtime/auth-coordinator.ts";
import type { AuthSessionLifecycleBus } from "../../../src/features/auth/runtime/session-sync.ts";
import { $auth, resetAuthState } from "../../../src/features/auth/store/auth.store.ts";

const session = {
  id: "session-1",
  userId: "account-1",
  authMethod: "password" as const,
  lastProofOfPossessionAt: "2026-09-22T10:00:00.000Z",
  createdAt: "2026-09-22T09:00:00.000Z",
  expiresAt: "2026-10-22T09:00:00.000Z",
};

function createBus() {
  const published: Array<"available" | "invalidated"> = [];
  const listeners = new Set<(event: "available" | "invalidated") => void>();
  const bus: AuthSessionLifecycleBus = {
    publish(event) {
      published.push(event);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return {
    bus,
    published,
    emit(event: "available" | "invalidated") {
      for (const listener of listeners) listener(event);
    },
  };
}

function createGateway(overrides: Partial<AuthSessionGateway> = {}) {
  let resolveCalls = 0;
  let logoutCalls = 0;
  const gateway: AuthSessionGateway = {
    async resolveCurrentSession() {
      resolveCalls += 1;
      return session;
    },
    async logoutCurrentSession() {
      logoutCalls += 1;
      return { status: 204 as const };
    },
    ...overrides,
  };
  return {
    gateway,
    calls: {
      resolve: () => resolveCalls,
      logout: () => logoutCalls,
    },
  };
}

test.beforeEach(() => {
  resetAuthState();
});

test("deduplicates concurrent session resolution", async () => {
  let release!: (value: typeof session) => void;
  let resolveCalls = 0;
  const pending = new Promise<typeof session>((resolve) => {
    release = resolve;
  });
  const { gateway } = createGateway({
    resolveCurrentSession: async () => {
      resolveCalls += 1;
      return pending;
    },
  });
  const coordinator = createAuthCoordinator({ gateway, bus: createBus().bus });

  const first = coordinator.resolve();
  const second = coordinator.resolve();
  assert.strictEqual(first, second);

  release(session);
  await Promise.all([first, second]);

  assert.equal(resolveCalls, 1);
  assert.equal($auth.get().status, "authenticated");
  assert.equal($auth.get().session?.id, session.id);
});

test("publishes availability only after the session is confirmed", async () => {
  let release!: (value: typeof session) => void;
  const pending = new Promise<typeof session>((resolve) => {
    release = resolve;
  });
  const lifecycle = createBus();
  const { gateway } = createGateway({
    resolveCurrentSession: async () => pending,
  });
  const coordinator = createAuthCoordinator({ gateway, bus: lifecycle.bus });

  const establishment = coordinator.establish();
  assert.deepEqual(lifecycle.published, []);

  release(session);
  await establishment;

  assert.deepEqual(lifecycle.published, ["available"]);
});

test("logout is a single-flight transition and publishes one invalidation", async () => {
  const { gateway, calls } = createGateway();
  const lifecycle = createBus();
  const coordinator = createAuthCoordinator({ gateway, bus: lifecycle.bus });
  await coordinator.resolve();
  lifecycle.published.length = 0;

  const first = coordinator.logoutCurrent();
  const second = coordinator.logoutCurrent();
  assert.strictEqual(first, second);
  await Promise.all([first, second]);

  assert.equal(calls.logout(), 1);
  assert.equal($auth.get().status, "anonymous");
  assert.deepEqual(lifecycle.published, ["invalidated"]);
});

test("possession proof requirement does not invalidate the session", async () => {
  const { gateway } = createGateway({
    async logoutCurrentSession() {
      return { status: 401 as const, errorCode: "AUTH_REQUIRED" };
    },
  });
  const lifecycle = createBus();
  const coordinator = createAuthCoordinator({ gateway, bus: lifecycle.bus });
  await coordinator.resolve();

  const result = await coordinator.logoutCurrent();

  assert.deepEqual(result, { ok: false, code: "AUTH_REQUIRED" });
  assert.equal($auth.get().status, "authenticated");
  assert.deepEqual(lifecycle.published, []);
});

test("remote lifecycle events resolve or invalidate the local session", async () => {
  const { gateway, calls } = createGateway();
  const lifecycle = createBus();
  const coordinator = createAuthCoordinator({ gateway, bus: lifecycle.bus });
  const stop = coordinator.start();

  lifecycle.emit("available");
  await coordinator.whenIdle();
  assert.equal(calls.resolve(), 1);
  assert.equal($auth.get().status, "authenticated");

  lifecycle.emit("invalidated");
  assert.equal($auth.get().status, "anonymous");

  stop();
});
