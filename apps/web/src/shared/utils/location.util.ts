export function getReturnToFromLocation(fallback = '/') {
  if (typeof window === 'undefined') return fallback;
  return window.location.pathname + window.location.search + window.location.hash;
}
