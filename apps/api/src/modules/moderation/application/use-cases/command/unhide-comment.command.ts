import { Injectable } from '@nestjs/common';
import { ModerationTargetVisibilityPort } from '../../ports/moderation-target-visibility.port';

@Injectable()
export class UnhideCommentCommand {
  constructor(private readonly visibility: ModerationTargetVisibilityPort) {}
  execute(commentId: string): Promise<void> {
    return this.visibility.unhideComment(commentId);
  }
}
