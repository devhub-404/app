import type { ActorRole } from '../../features/auth/public/access.ts';
import { accessRequirement as authenticationRequirement } from '../../features/auth/public/access.ts';
import { newsEditorialRolesForPath } from '../../features/news/public/access.ts';
import { panelRolesForPath } from '../../features/panel/public/access.ts';
import { resourceEditorialRolesForPath } from '../../features/resource/public/access.ts';

export type RouteAccess =
  { kind: 'public' } | { kind: 'authenticated' } | { kind: 'roles'; roles: readonly Exclude<ActorRole, null>[] };

/**
 * Canonical application route policy.
 *
 * Features own their role-specific route rules; the app access boundary
 * composes them with the authentication requirement into one decision used by
 * both SSR middleware and browser route reconciliation.
 */
export function routeAccess(pathname: string): RouteAccess {
  const authentication = authenticationRequirement(pathname);
  if (authentication.kind === 'public') return authentication;

  const panelRoles = panelRolesForPath(pathname);
  if (panelRoles !== null) return { kind: 'roles', roles: panelRoles };

  const newsRoles = newsEditorialRolesForPath(pathname);
  if (newsRoles !== null) return { kind: 'roles', roles: newsRoles };

  const resourceRoles = resourceEditorialRolesForPath(pathname);
  if (resourceRoles !== null) return { kind: 'roles', roles: resourceRoles };

  return { kind: 'authenticated' };
}

export function requiresRouteAuthentication(access: RouteAccess): boolean {
  return access.kind !== 'public';
}

export function canAccessRoute(access: RouteAccess, role: ActorRole | undefined): boolean {
  if (access.kind === 'public') return true;
  if (role === undefined) return false;
  if (access.kind === 'authenticated') return true;
  return role !== null && access.roles.includes(role);
}
