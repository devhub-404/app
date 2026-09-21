import type { ActorRole } from '../../auth/public/access.ts';

export const newsEditorialRoles = ['curator', 'admin'] as const satisfies readonly Exclude<ActorRole, null>[];

export function requiresNewsEditorialAccess(pathname: string): boolean {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  return normalizedPathname === '/news/new' || /^\/news\/[^/]+\/edit$/.test(normalizedPathname);
}

export function newsEditorialRolesForPath(pathname: string): readonly Exclude<ActorRole, null>[] | null {
  return requiresNewsEditorialAccess(pathname) ? newsEditorialRoles : null;
}

export function canAccessNewsEditorialPath(pathname: string, role: string | null | undefined): boolean {
  const roles = newsEditorialRolesForPath(pathname);
  return roles === null || roles.some((allowedRole) => allowedRole === role);
}
