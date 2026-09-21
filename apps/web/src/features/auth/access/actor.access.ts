export type ActorRole = 'curator' | 'moderator' | 'admin' | null;

/**
 * Authorization projection used by client-side visibility predicates.
 * It is advisory only: the backend policy remains authoritative.
 */
export type Actor = {
  accountId: string | null;
  role: ActorRole;
  organizationIds: readonly string[];
  ownerOrganizationIds?: readonly string[];
};

export const anonymousActor: Actor = {
  accountId: null,
  role: null,
  organizationIds: [],
  ownerOrganizationIds: [],
};

export function isCurator(actor: Actor): boolean {
  return actor.role === 'curator';
}

export function isAdmin(actor: Actor): boolean {
  return actor.role === 'admin';
}

export function canCurate(actor: Actor): boolean {
  return actor.role === 'curator' || actor.role === 'admin';
}

export function canModerate(actor: Actor): boolean {
  return actor.role === 'moderator' || actor.role === 'admin';
}

/** True only for the moderator role; administrator has moderation authority separately. */
export function isModerator(actor: Actor): boolean {
  return actor.role === 'moderator';
}
