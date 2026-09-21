export type SessionSyncEvent = 'available' | 'invalidated';
type SessionSyncMessage = { event: SessionSyncEvent; nonce: string };

const channelName = 'devhub:session';
const storageKey = 'devhub:session:event';
const localEventName = 'devhub:session-lifecycle';
let channel: BroadcastChannel | null | undefined;

const seenNonces = new Set<string>();

function getChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel;
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    channel = null;
    return channel;
  }

  try {
    channel = new BroadcastChannel(channelName);
  } catch {
    channel = null;
  }
  return channel;
}

function isSessionSyncEvent(value: unknown): value is SessionSyncEvent {
  return value === 'available' || value === 'invalidated';
}

/**
 * Synchronizes session lifecycle events between same-origin tabs. The channel
 * deliberately never carries a session secret or another credential.
 */
export function publishSessionEvent(event: SessionSyncEvent): void {
  const current = getChannel();
  const message: SessionSyncMessage = { event, nonce: crypto.randomUUID() };
  if (current) {
    current.postMessage(message);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(localEventName, { detail: message }));
  }

  // Always publish the storage signal as well. Tabs can have different
  // capabilities (for example, an embedded tab may lack BroadcastChannel),
  // and the nonce prevents tabs that support both transports from processing
  // the same lifecycle event twice.
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(message));
  } catch {
    // Session synchronization is best-effort; the server remains authoritative.
  }
}

export function listenForSessionEvents(listener: (event: SessionSyncEvent) => void): () => void {
  const current = getChannel();
  const emit = (value: unknown) => {
    if (isSessionSyncEvent(value)) {
      listener(value);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const payload = value as { event?: unknown; nonce?: unknown };
    if (!isSessionSyncEvent(payload.event) || typeof payload.nonce !== 'string' || seenNonces.has(payload.nonce)) {
      return;
    }
    seenNonces.add(payload.nonce);
    if (seenNonces.size > 128) seenNonces.delete(seenNonces.values().next().value as string);
    listener(payload.event);
  };
  const handleMessage = (message: MessageEvent<unknown>) => {
    emit(message.data);
  };
  const handleLocal = (event: Event) => {
    emit((event as CustomEvent<unknown>).detail);
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) return;
    try {
      emit(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed or stale storage values.
    }
  };

  if (current) {
    current.addEventListener('message', handleMessage);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener(localEventName, handleLocal);
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    current?.removeEventListener('message', handleMessage);
    if (typeof window !== 'undefined') {
      window.removeEventListener(localEventName, handleLocal);
      window.removeEventListener('storage', handleStorage);
    }
  };
}
