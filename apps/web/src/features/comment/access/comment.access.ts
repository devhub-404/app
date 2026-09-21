import { canModerate, type Actor } from '../../auth/public/access.ts';

export function canModerateComments(actor: Actor): boolean {
  return canModerate(actor);
}
