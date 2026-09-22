import { backoff, random } from "@utilify/core";
import { NotificationsApi } from "@/features/account/api/notification.api.ts";
import type {
  NotificationItem,
  NotificationSync,
} from "@/features/account/types/notification.type.ts";
import {
  $notifications,
  initialNotificationsState,
} from "@/features/account/store/notification.store";
import { readApiData } from "@/shared/api";
import {
  getSessionScope,
  isAuthenticatedSessionScope,
  isCurrentSessionScope,
} from "@/app/session/session-scope";

const MIN_POLL_MS = 30_000;
const MAX_POLL_MS = 60_000;
const MAX_VISIBLE_ITEMS = 50;
let consumers = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let inFlight: Promise<boolean> | null = null;
let disposed = false;
let idleLevel = 0;
let failureLevel = 0;
let activeAccountId: string | null = null;
let runtimeCleanup: (() => void) | null = null;

/** Starts the tab-global notification runtime exactly once. */
export function ensureNotificationsRuntime() {
  if (runtimeCleanup) return;
  runtimeCleanup = startNotificationsSync();
}

export function setNotificationsAccountScope(accountId: string | null) {
  if (activeAccountId === accountId) return;
  activeAccountId = accountId;
  inFlight = null;
  idleLevel = 0;
  failureLevel = 0;
  if (timer) clearTimeout(timer);
  $notifications.set(initialNotificationsState);
  if (accountId && consumers > 0) resetAndSyncNotifications();
}

function merge(items: NotificationItem[]) {
  const current = $notifications.get().items;
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of items) byId.set(item.id, item);
  $notifications.set({
    ...$notifications.get(),
    items: [...byId.values()]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, MAX_VISIBLE_ITEMS),
  });
}

export async function syncNotifications(): Promise<boolean> {
  if (!activeAccountId) return false;
  const scope = getSessionScope();
  if (
    scope.accountId !== activeAccountId ||
    !isAuthenticatedSessionScope(activeAccountId)
  )
    return false;
  if (
    disposed ||
    typeof document === "undefined" ||
    document.visibilityState !== "visible"
  )
    return false;
  if (inFlight) return inFlight;
  let task: Promise<boolean>;
  task = backoff(
    async () => {
      if (!isCurrentSessionScope(scope)) return false;
      const state = $notifications.get();
      $notifications.set({ ...state, loading: true });
      const result = await NotificationsApi.sync(state.cursor, {
        signal: scope.signal,
      });
      if (!isCurrentSessionScope(scope)) return false;
      if (result.error) throw new Error("NOTIFICATIONS_SYNC_FAILED");
      const data = readApiData<NotificationSync>(result);
      if (!data) throw new Error("NOTIFICATIONS_SYNC_FAILED");
      merge(data.items);
      $notifications.set({
        ...$notifications.get(),
        cursor: data.nextCursor ?? state.cursor,
        unread: data.unreadCount,
        loading: false,
      });
      idleLevel = data.items.length ? 0 : Math.min(idleLevel + 1, 4);
      failureLevel = 0;
      return data.items.length > 0;
    },
    { initialDelay: 400, maxAttempts: 3, maxDelay: 8_000, jitterMode: "full" },
  )
    .catch(() => {
      if (!isCurrentSessionScope(scope)) return false;
      failureLevel = Math.min(failureLevel + 1, 4);
      $notifications.set({ ...$notifications.get(), loading: false });
      return false;
    })
    .finally(() => {
      if (inFlight === task) inFlight = null;
    });
  inFlight = task;
  return task;
}

function schedule() {
  if (
    !activeAccountId ||
    !isAuthenticatedSessionScope(activeAccountId) ||
    disposed ||
    consumers === 0 ||
    typeof document === "undefined" ||
    document.visibilityState !== "visible"
  )
    return;
  if (timer) clearTimeout(timer);
  const exponent = Math.max(idleLevel, failureLevel);
  const delay = Math.min(MAX_POLL_MS, MIN_POLL_MS * 2 ** exponent);
  timer = setTimeout(
    async () => {
      await syncNotifications();
      schedule();
    },
    Math.round(delay * random(0.85, 1.15)),
  );
}

export function resetAndSyncNotifications() {
  if (!activeAccountId) return;
  idleLevel = 0;
  failureLevel = 0;
  if (timer) clearTimeout(timer);
  void syncNotifications().finally(() => {
    schedule();
  });
}

export function startNotificationsSync() {
  consumers += 1;
  disposed = false;
  if (consumers === 1) {
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", resetAndSyncNotifications);
    window.addEventListener("pointerdown", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    resetAndSyncNotifications();
  }
  return () => {
    consumers = Math.max(0, consumers - 1);
    if (consumers !== 0) return;
    disposed = true;
    if (timer) clearTimeout(timer);
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("focus", resetAndSyncNotifications);
    window.removeEventListener("pointerdown", handleActivity);
    window.removeEventListener("keydown", handleActivity);
    $notifications.set(initialNotificationsState);
  };
}

function handleVisibility() {
  if (document.visibilityState === "visible") resetAndSyncNotifications();
  else if (timer) clearTimeout(timer);
}
function handleActivity() {
  if (document.visibilityState === "visible" && idleLevel > 0) {
    idleLevel = 0;
    schedule();
  }
}

export async function markNotificationRead(item: NotificationItem) {
  if (item.readAt || !activeAccountId) return;
  const scope = getSessionScope();
  if (
    scope.accountId !== activeAccountId ||
    !isAuthenticatedSessionScope(activeAccountId)
  )
    return;
  const result = await NotificationsApi.markRead(item.id, {
    signal: scope.signal,
  });
  if (!isCurrentSessionScope(scope)) return;
  if (result.data?.data) {
    merge([result.data.data]);
    $notifications.set({
      ...$notifications.get(),
      unread: Math.max(0, $notifications.get().unread - 1),
    });
  }
}

export async function markAllNotificationsRead() {
  if (!activeAccountId) return;
  const scope = getSessionScope();
  if (
    scope.accountId !== activeAccountId ||
    !isAuthenticatedSessionScope(activeAccountId)
  )
    return;
  const result = await NotificationsApi.markAllRead({ signal: scope.signal });
  if (!isCurrentSessionScope(scope)) return;
  if (!result.data?.data) return;
  const now = new Date().toISOString();
  merge(
    $notifications
      .get()
      .items.map((item) => (item.readAt ? item : { ...item, readAt: now })),
  );
  $notifications.set({ ...$notifications.get(), unread: 0 });
}
