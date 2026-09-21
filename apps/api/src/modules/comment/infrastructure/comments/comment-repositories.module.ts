import { Module } from '@nestjs/common';
import { CommentQueryRepository } from '@/modules/comment/application/comments/ports/repositories/comment.query.repository';
import { CommentRepository } from '@/modules/comment/application/comments/ports/repositories/comment.repository';
import { CommentStatisticsRepository } from '@/modules/comment/application/comments/ports/repositories/comment-statistics.repository';
import { DrizzleCommentQueryRepository } from '@/modules/comment/infrastructure/comments/repositories/comment.query.repository';
import { DrizzleCommentRepository } from '@/modules/comment/infrastructure/comments/repositories/comment.repository';
import { DrizzleCommentStatisticsRepository } from '@/modules/comment/infrastructure/comments/repositories/comment-statistics.repository';
import { AccountProfileReadModule } from '@/modules/account/public/account-profile-read.module';

@Module({
  imports: [AccountProfileReadModule],
  providers: [
    { provide: CommentQueryRepository, useClass: DrizzleCommentQueryRepository },
    { provide: CommentRepository, useClass: DrizzleCommentRepository },
    { provide: CommentStatisticsRepository, useClass: DrizzleCommentStatisticsRepository },
  ],
  exports: [CommentQueryRepository, CommentRepository, CommentStatisticsRepository],
})
export class CommentRepositoriesModule {}
