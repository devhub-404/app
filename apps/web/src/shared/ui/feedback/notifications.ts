import { emitToast, type ToastPayload } from '@/shared/ui/feedback/toast';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import type { MessageCode } from '@/shared/i18n/core/messages';

export type NotificationPayload = ToastPayload;

export type Notifier = {
  notify: (payload: NotificationPayload) => void;
};

let notifier: Notifier = { notify: emitToast };

// Port for user-facing notifications (toasts, etc).
// Services can depend on this port without knowing the UI mechanism.
export function setNotifier(next: Notifier) {
  notifier = next;
}

export function notify(payload: NotificationPayload) {
  notifier.notify(payload);
}

export function notifySuccess(code?: MessageCode | string | null) {
  const resolved = resolveMessage(code);
  if (!resolved) return '';
  notify({ message: resolved, variant: 'success' });
  return resolved;
}

export function notifyError(code?: MessageCode | string | null) {
  const resolved = resolveMessage(code);
  if (!resolved) return '';
  notify({ message: resolved, variant: 'error' });
  return resolved;
}

export function notifyInfo(code?: MessageCode | string | null) {
  const resolved = resolveMessage(code);
  if (!resolved) return '';
  notify({ message: resolved, variant: 'info' });
  return resolved;
}
