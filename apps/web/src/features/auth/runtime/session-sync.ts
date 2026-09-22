export type AuthSessionLifecycleEvent = "available" | "invalidated";

type SessionSyncMessage = {
  type: "auth-session";
  event: AuthSessionLifecycleEvent;
  nonce: string;
  sourceTabId: string;
};

export type AuthSessionLifecycleBus = {
  publish(event: AuthSessionLifecycleEvent): void;
  subscribe(listener: (event: AuthSessionLifecycleEvent) => void): () => void;
};

const channelName = "devhub:auth-session";
const storageKey = "devhub:auth-session:event";
const localEventName = "devhub:auth-session-lifecycle";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function createAuthSessionLifecycleBus(): AuthSessionLifecycleBus {
  const sourceTabId = createId();
  const seenNonces = new Set<string>();
  const localListeners = new Set<
    (event: AuthSessionLifecycleEvent) => void
  >();
  let channel: BroadcastChannel | null = null;

  if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
    try {
      channel = new BroadcastChannel(channelName);
    } catch {
      channel = null;
    }
  }

  const accept = (
    value: unknown,
    listener: (event: AuthSessionLifecycleEvent) => void,
  ) => {
    if (!value || typeof value !== "object") return;
    const message = value as Partial<SessionSyncMessage>;
    if (
      message.type !== "auth-session" ||
      (message.event !== "available" && message.event !== "invalidated") ||
      typeof message.nonce !== "string" ||
      typeof message.sourceTabId !== "string" ||
      message.sourceTabId === sourceTabId ||
      seenNonces.has(message.nonce)
    ) {
      return;
    }
    seenNonces.add(message.nonce);
    if (seenNonces.size > 128) {
      const oldest = seenNonces.values().next().value;
      if (oldest) seenNonces.delete(oldest);
    }
    listener(message.event);
  };

  return {
    publish(event) {
      const message: SessionSyncMessage = {
        type: "auth-session",
        event,
        nonce: createId(),
        sourceTabId,
      };
      for (const listener of localListeners) listener(event);
      channel?.postMessage(message);
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent(localEventName, { detail: message }),
      );
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(message));
      } catch {
        // Synchronization is best-effort; the API remains authoritative.
      }
    },
    subscribe(listener) {
      localListeners.add(listener);
      const onMessage = (event: MessageEvent<unknown>) =>
        accept(event.data, listener);
      const onLocal = (event: Event) =>
        accept((event as CustomEvent<unknown>).detail, listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key !== storageKey || !event.newValue) return;
        try {
          accept(JSON.parse(event.newValue), listener);
        } catch {
          // Ignore malformed storage signals.
        }
      };

      channel?.addEventListener("message", onMessage);
      window?.addEventListener(localEventName, onLocal);
      window?.addEventListener("storage", onStorage);
      if (typeof window !== "undefined") {
        try {
          const stored = window.localStorage.getItem(storageKey);
          if (stored) accept(JSON.parse(stored), listener);
        } catch {
          // Ignore unavailable or malformed replay state.
        }
      }

      return () => {
        localListeners.delete(listener);
        channel?.removeEventListener("message", onMessage);
        window?.removeEventListener(localEventName, onLocal);
        window?.removeEventListener("storage", onStorage);
      };
    },
  };
}
