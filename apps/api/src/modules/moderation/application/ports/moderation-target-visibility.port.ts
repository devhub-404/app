import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

export type HiddenModerationTarget =
  | { kind: 'resource'; resourceKind: ResourceKind; resourceId: string; hiddenAt: string }
  | { kind: 'comment'; commentId: string; hiddenAt: string };

export abstract class ModerationTargetVisibilityPort {
  abstract unhideResource(resourceId: string): Promise<void>;
  abstract unhideComment(commentId: string): Promise<void>;
  abstract listHidden(): Promise<HiddenModerationTarget[]>;
}
