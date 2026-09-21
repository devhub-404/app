export class InvalidHttpUrlError extends Error {
  constructor() {
    super('INVALID_HTTP_URL');
  }
}

/**
 * Returns the canonical representation persisted by the platform.
 * There is intentionally no parallel `normalizedUrl` state: persisted `url`
 * is already canonical.
 */
export function canonicalizeHttpUrl(value: string): string {
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error();
    parsed.hash = '';
    parsed.hostname = parsed.hostname.toLowerCase();

    return parsed.toString().replace(/\/$/, '');
  } catch {
    throw new InvalidHttpUrlError();
  }
}
