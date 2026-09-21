import { canCurate, canModerate, isAdmin, type Actor } from '../../auth/public/access.ts';

export function canEditEvent(actor: Actor): boolean {
  return canCurate(actor);
}

export function canDeleteEvent(actor: Actor): boolean {
  return isAdmin(actor);
}

export function canReviewEventSuggestions(actor: Actor): boolean {
  return canCurate(actor);
}

export function canViewEventManagement(actor: Actor): boolean {
  return canCurate(actor) || canModerate(actor);
}
