import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { User } from '@/modules/auth/public/http';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { UpdateCommentCommand } from '@/modules/comment/application/use-cases/command/update-comment.command';
import { DeleteCommentCommand } from '@/modules/comment/application/use-cases/command/delete-comment.command';
import { ListMyCommentsQuery } from '@/modules/comment/application/use-cases/query/list-my-comments.query';
import { ListCommentsForModerationQuery } from '@/modules/comment/application/use-cases/query/list-comments-for-moderation.query';
import { ListCommentsQueryDTO, UpdateCommentDTO } from '@/modules/comment/application/comments/dtos/in';
import { CommentDTO } from '@/modules/comment/application/comments/dtos/out';
import { Role } from '@/shared/kernel/auth/role';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';
import type { Paginated } from '@/shared/kernel/pagination';

@Controller('comments')
@UseGuards(AuthGuard, RoleGuard)
export class CommentsController {
  constructor(
    private readonly updateCommentCommand: UpdateCommentCommand,
    private readonly deleteCommentCommand: DeleteCommentCommand,
    private readonly listMyCommentsQuery: ListMyCommentsQuery,
    private readonly listCommentsForAdministrationQuery: ListCommentsForModerationQuery,
  ) {}

  @Version('1')
  @Get('me')
  @AppResponse('CONTENT_MY_COMMENTS_LISTED', CommentDTO, { paginated: true })
  async listMine(@User('id') userId: string, @Query() query: ListCommentsQueryDTO): Promise<Paginated<CommentDTO>> {
    return await this.listMyCommentsQuery.execute(userId, query);
  }

  @Version('1')
  @Get('administration')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_ADMIN_COMMENTS_LISTED', CommentDTO, { paginated: true })
  async listForAdministration(@Query() query: ListCommentsQueryDTO): Promise<Paginated<CommentDTO>> {
    return await this.listCommentsForAdministrationQuery.execute(query);
  }

  @Version('1')
  @Patch(':id')
  @AppResponse('CONTENT_COMMENT_UPDATED')
  async updateComment(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) commentId: string,
    @Body() payload: UpdateCommentDTO,
  ): Promise<void> {
    await this.updateCommentCommand.execute(user, commentId, payload);
  }

  @Version('1')
  @Delete(':id')
  @AppResponse('CONTENT_COMMENT_DELETED')
  async deleteComment(@User() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) commentId: string): Promise<void> {
    await this.deleteCommentCommand.execute(user, commentId);
  }
}
