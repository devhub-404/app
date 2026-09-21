import type { ResourceIdentity, ResourceKind } from './resource-identity';

/** Application-facing contract for the global Resource identity registry. */
export abstract class ResourceIdentityPort {
  abstract create(kind: ResourceKind, context?: unknown): Promise<ResourceIdentity>;
  abstract get(id: string, context?: unknown): Promise<ResourceIdentity | null>;
  abstract assertKind(id: string, kind: ResourceKind, context?: unknown): Promise<void>;
  abstract remove(id: string, context?: unknown): Promise<void>;
  abstract removeOrphans(context?: unknown): Promise<number>;
}
