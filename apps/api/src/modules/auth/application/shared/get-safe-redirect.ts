export function getSafeRedirect(value: unknown, siteUrl: string): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  if (value.startsWith('/') && !value.startsWith('//')) return value;

  const baseUrl = siteUrl;

  try {
    const target = new URL(value);
    const site = new URL(baseUrl);

    if (target.origin !== site.origin) return null;

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}
