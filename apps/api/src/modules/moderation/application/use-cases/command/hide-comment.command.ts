import { Injectable } from '@nestjs/common';
import { CommentModerationPort } from '@/modules/comment/public/comment-moderation.port';

@Injectable()
export class HideCommentCommand {
  constructor(private readonly comments: CommentModerationPort) {}
  execute(commentId: string): Promise<void> {
    return this.comments.apply(commentId, 'hide_comment');
  }
}
