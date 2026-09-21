import { canCurate, canModerate, isAdmin, type Actor } from '../../auth/public/access.ts';

export function canManageResources(actor: Actor): boolean {
  return canCurate(actor);
}

export function canArchiveResource(actor: Actor): boolean {
  return canManageResources(actor);
}

export function canUnarchiveResource(actor: Actor): boolean {
  return canManageResources(actor);
}

export function canDeleteResource(actor: Actor): boolean {
  return isAdmin(actor);
}

export function canViewResourceManagement(actor: Actor): boolean {
  return canCurate(actor) || canModerate(actor);
}

export function canReviewResourceSuggestions(actor: Actor): boolean {
  return canCurate(actor);
}
