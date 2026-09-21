import type { ActorRole } from '../../auth/public/access.ts';

export const resourceEditorialRoles = ['curator', 'admin'] as const satisfies readonly Exclude<ActorRole, null>[];

export function requiresResourceEditorialAccess(pathname: string): boolean {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  return normalizedPathname === '/resources/new' || /^\/resources\/[^/]+\/edit$/.test(normalizedPathname);
}

export function resourceEditorialRolesForPath(pathname: string): readonly Exclude<ActorRole, null>[] | null {
  return requiresResourceEditorialAccess(pathname) ? resourceEditorialRoles : null;
}

export function canAccessResourceEditorialPath(pathname: string, role: string | null | undefined): boolean {
  const roles = resourceEditorialRolesForPath(pathname);
  return roles === null || roles.some((allowedRole) => allowedRole === role);
}
