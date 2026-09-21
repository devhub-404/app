import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Role } from '@/shared/kernel/auth/role';
import { ListHiddenTargetsQuery } from '../application/use-cases/query';
import {
  HideCommentCommand,
  HideResourceCommand,
  UnhideCommentCommand,
  UnhideResourceCommand,
} from '../application/use-cases/command';

@Controller('moderation')
@UseGuards(AuthGuard, RoleGuard)
export class ModerationController {
  constructor(
    private readonly hideResource: HideResourceCommand,
    private readonly unhideResource: UnhideResourceCommand,
    private readonly hideComment: HideCommentCommand,
    private readonly unhideComment: UnhideCommentCommand,
    private readonly hiddenTargets: ListHiddenTargetsQuery,
  ) {}

  @Version('1')
  @Post('resources/:resourceId/hide')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED')
  hideResourceById(@Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.hideResource.execute(resourceId);
  }

  @Version('1')
  @Post('resources/:resourceId/unhide')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED')
  unhideResourceById(@Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.unhideResource.execute(resourceId);
  }

  @Version('1')
  @Post('comments/:commentId/hide')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED')
  hideCommentById(@Param('commentId', ParseUUIDPipe) commentId: string) {
    return this.hideComment.execute(commentId);
  }

  @Version('1')
  @Post('comments/:commentId/unhide')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED')
  unhideCommentById(@Param('commentId', ParseUUIDPipe) commentId: string) {
    return this.unhideComment.execute(commentId);
  }

  @Version('1')
  @Get('hidden')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_LISTED')
  listHidden() {
    return this.hiddenTargets.execute();
  }
}
