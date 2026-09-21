import { listenForSessionEvents } from '@/shared/auth/session-events';

type Handlers = {
  onAvailable: () => void;
  onInvalidated: () => void;
};

export function listenForSessionLifecycle(handlers: Handlers) {
  return listenForSessionEvents((event) => {
    if (event === 'available') handlers.onAvailable();
    else handlers.onInvalidated();
  });
}
