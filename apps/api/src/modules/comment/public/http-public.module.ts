import { Module } from '@nestjs/common';
import { CommentModule } from '@/modules/comment/comment.module';

@Module({ imports: [CommentModule], exports: [CommentModule] })
export class CommentHttpPublicModule {}
