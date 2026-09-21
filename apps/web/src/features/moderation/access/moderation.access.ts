import { canModerate, type Actor } from '../../auth/public/access.ts';

export function canRestoreHiddenContent(actor: Actor): boolean {
  return canModerate(actor);
}
