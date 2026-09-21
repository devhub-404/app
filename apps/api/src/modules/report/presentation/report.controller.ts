import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { AuthGuard, User } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Role } from '@/shared/kernel/auth/role';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { CreateResourceReportCommand } from '../application/use-cases/create-resource-report.command';
import { CreateCommentReportCommand } from '../application/use-cases/create-comment-report.command';
import {
  ReviewCommentReportCommand,
  ReviewResourceReportCommand,
} from '../application/use-cases/review-report.command';
import { CreateCommentReportDTO, CreateResourceReportDTO, ReviewReportDTO } from '../application/dtos/in';
import { ListCommentReportsQuery, ListResourceReportsQuery } from '../application/use-cases/list-reports.query';
import { ListReportsQueryDTO } from '../application/dtos/in/list-reports-query.dto';

@Controller()
@UseGuards(AuthGuard, RoleGuard)
export class ReportController {
  constructor(
    private readonly createResource: CreateResourceReportCommand,
    private readonly createComment: CreateCommentReportCommand,
    private readonly reviewResource: ReviewResourceReportCommand,
    private readonly reviewComment: ReviewCommentReportCommand,
    private readonly listResources: ListResourceReportsQuery,
    private readonly listComments: ListCommentReportsQuery,
  ) {}

  @Version('1')
  @Post('resources/:resourceId/reports')
  reportResource(
    @User('id') accountId: string,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Body() input: CreateResourceReportDTO,
  ) {
    return this.createResource.execute({ ...input, accountId, resourceId });
  }

  @Version('1')
  @Post('comments/:commentId/reports')
  reportComment(
    @User('id') accountId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() input: CreateCommentReportDTO,
  ) {
    return this.createComment.execute({ ...input, accountId, commentId });
  }

  @Version('1')
  @Get('reports/resources')
  @Roles([Role.MODERATOR, Role.ADMIN])
  listResourceReports(@Query() query: ListReportsQueryDTO) {
    return this.listResources.execute(query.status);
  }

  @Version('1')
  @Get('reports/comments')
  @Roles([Role.MODERATOR, Role.ADMIN])
  listCommentReports(@Query() query: ListReportsQueryDTO) {
    return this.listComments.execute(query.status);
  }

  @Version('1')
  @Patch('reports/resources/:id')
  @Roles([Role.MODERATOR, Role.ADMIN])
  reviewResourceReport(
    @User('id') reviewerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: ReviewReportDTO,
  ) {
    return this.reviewResource.execute(id, reviewerId, input);
  }

  @Version('1')
  @Patch('reports/comments/:id')
  @Roles([Role.MODERATOR, Role.ADMIN])
  reviewCommentReport(
    @User('id') reviewerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: ReviewReportDTO,
  ) {
    return this.reviewComment.execute(id, reviewerId, input);
  }
}
