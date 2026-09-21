export type ToastPayload = {
  message: string;
  variant?: 'success' | 'error' | 'info';
};

const PENDING_TOAST_KEY = 'devhub:pending-toast';

export const emitToast = (payload: ToastPayload) => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload));
  } catch {
    // A blocked storage must not prevent the in-page feedback event.
  }
  window.dispatchEvent(new CustomEvent('devhub:toast', { detail: payload }));
};

export const consumePendingToast = (): ToastPayload | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_TOAST_KEY);
    window.sessionStorage.removeItem(PENDING_TOAST_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw) as ToastPayload;
    return typeof payload.message === 'string' && payload.message.trim() ? payload : null;
  } catch {
    return null;
  }
};
