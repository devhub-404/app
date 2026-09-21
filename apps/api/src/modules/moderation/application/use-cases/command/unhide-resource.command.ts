import { Injectable } from '@nestjs/common';
import { ModerationTargetVisibilityPort } from '../../ports/moderation-target-visibility.port';

@Injectable()
export class UnhideResourceCommand {
  constructor(private readonly visibility: ModerationTargetVisibilityPort) {}
  execute(resourceId: string): Promise<void> {
    return this.visibility.unhideResource(resourceId);
  }
}
