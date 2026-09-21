import { Body, Controller, Get, Param, Post, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard, User } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { Public } from '@/shared/nest/decorators/public';
import { ListCommentsQuery } from '@/modules/comment/application/use-cases/query/list-comments.query';
import { CreateCommentCommand } from '@/modules/comment/application/use-cases/command/create-comment.command';
import { CreateCommentDTO } from '@/modules/comment/application/comments/dtos/in';
import { CommentCreatedDTO, CommentDTO } from '@/modules/comment/application/comments/dtos/out';

@Controller()
@UseGuards(AuthGuard, RoleGuard)
export class DomainCommentsController {
  constructor(
    private readonly listComments: ListCommentsQuery,
    private readonly createComment: CreateCommentCommand,
  ) {}

  @Version('1')
  @Get('articles/:articleId/comments')
  @Public()
  @AppResponse('CONTENT_COMMENTS_LISTED', CommentDTO, { isArray: true })
  listArticleComments(@Param('articleId', ParseUUIDPipe) articleId: string) {
    return this.listComments.execute(articleId);
  }

  @Version('1')
  @Post('articles/:articleId/comments')
  @AppResponse('CONTENT_COMMENT_CREATED', CommentCreatedDTO)
  createArticleComment(
    @User('id') userId: string,
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() payload: CreateCommentDTO,
  ) {
    return this.createComment.execute(userId, articleId, payload);
  }

  @Version('1')
  @Get('news/:newsId/comments')
  @Public()
  @AppResponse('CONTENT_COMMENTS_LISTED', CommentDTO, { isArray: true })
  listNewsComments(@Param('newsId', ParseUUIDPipe) newsId: string) {
    return this.listComments.execute(newsId);
  }

  @Version('1')
  @Post('news/:newsId/comments')
  @AppResponse('CONTENT_COMMENT_CREATED', CommentCreatedDTO)
  createNewsComment(
    @User('id') userId: string,
    @Param('newsId', ParseUUIDPipe) newsId: string,
    @Body() payload: CreateCommentDTO,
  ) {
    return this.createComment.execute(userId, newsId, payload);
  }
}
