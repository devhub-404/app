const SESSION_COOKIE_NAME = 'devhub_session';
const SESSION_COOKIE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function readSessionCookie(request: Request): string | null {
  const raw = request.headers.get('cookie');
  if (!raw) return null;

  for (const item of raw.split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0) continue;
    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if (name === SESSION_COOKIE_NAME && SESSION_COOKIE_PATTERN.test(value)) {
      return `${SESSION_COOKIE_NAME}=${value}`;
    }
  }

  return null;
}

export function hasValidSessionCookie(request: Request): boolean {
  return readSessionCookie(request) !== null;
}
