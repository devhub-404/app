export const SESSION_COOKIE_NAME = 'devhub_session';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

const SESSION_SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isSessionSecret(value: unknown): value is string {
  return typeof value === 'string' && SESSION_SECRET_PATTERN.test(value);
}

export function nextSessionExpiry(from = new Date()): Date {
  return new Date(from.getTime() + SESSION_MAX_AGE_MS);
}
