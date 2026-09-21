import { canCurate, canModerate, isAdmin, type Actor } from '../../auth/public/access.ts';

export function canEditNews(actor: Actor): boolean {
  return canCurate(actor);
}

export function canPublishNews(actor: Actor): boolean {
  return canEditNews(actor);
}

export function canArchiveNews(actor: Actor): boolean {
  return canEditNews(actor);
}

export function canUnarchiveNews(actor: Actor): boolean {
  return canEditNews(actor);
}

export function canDeleteNews(actor: Actor): boolean {
  return isAdmin(actor);
}

export function canManageNews(actor: Actor): boolean {
  return canCurate(actor) || canModerate(actor);
}

export function canReviewNewsSuggestions(actor: Actor): boolean {
  return canCurate(actor);
}
