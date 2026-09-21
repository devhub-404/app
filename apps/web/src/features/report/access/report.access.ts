import { canModerate, type Actor } from '../../auth/public/access.ts';

export function canReviewReports(actor: Actor): boolean {
  return canModerate(actor);
}
