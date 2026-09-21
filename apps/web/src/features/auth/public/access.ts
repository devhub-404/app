export type { Actor, ActorRole } from '../access/actor.access.ts';
export { anonymousActor, canCurate, canModerate, isAdmin, isCurator, isModerator } from '../access/actor.access.ts';
export { getClientActor, isClientAccessAllowed } from '../access/client-actor.access.ts';
export { accessRequirement, requiresAuthentication, type AccessRequirement } from '../access/route.access.ts';
