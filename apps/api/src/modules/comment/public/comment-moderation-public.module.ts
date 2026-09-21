import { Module } from '@nestjs/common';
import { CommentRepositoriesModule } from '@/modules/comment/infrastructure/comments/comment-repositories.module';
import { CommentModerationPort } from './comment-moderation.port';
import { CommentModerationService } from './comment-moderation.service';

@Module({
  imports: [CommentRepositoriesModule],
  providers: [{ provide: CommentModerationPort, useClass: CommentModerationService }],
  exports: [CommentModerationPort],
})
export class CommentModerationPublicModule {}
