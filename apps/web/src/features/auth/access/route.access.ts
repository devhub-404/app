const authenticatedPrefixes = ['/account', '/panel'];
const authenticatedRouteRules = [
  /^\/(articles|news|questions|projects|jobs|events|resources|organizations)\/new$/,
  /^\/(articles|news|resources)\/[^/]+\/edit$/,
  /^\/news\/suggest$/,
  /^\/resources\/submit$/,
  /^\/organizations\/[^/]+\/settings$/,
];

export type AccessRequirement = { kind: 'public' } | { kind: 'authenticated' };

export function accessRequirement(pathname: string): AccessRequirement {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';

  if (
    authenticatedPrefixes.some((prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`))
  ) {
    return { kind: 'authenticated' };
  }

  return authenticatedRouteRules.some((pattern) => pattern.test(normalizedPathname))
    ? { kind: 'authenticated' }
    : { kind: 'public' };
}

export function requiresAuthentication(pathname: string): boolean {
  return accessRequirement(pathname).kind === 'authenticated';
}
