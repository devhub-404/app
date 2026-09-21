import { Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Role } from '@/shared/kernel/auth/role';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { User } from '@/shared/nest/decorators/user.decorator';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { ListFeedbackForTriageQuery } from '../application/use-cases/query/list-feedback-for-triage.query';
import { SubmitFeedbackCommand } from '../application/use-cases/command/submit-feedback.command';
import { UpdateFeedbackStatusCommand } from '../application/use-cases/command/update-feedback-status.command';
import { ListFeedbackDTO, SubmitFeedbackDTO, UpdateFeedbackStatusDTO, FeedbackDTO } from '../application/dtos';
import type { Paginated } from '@/shared/kernel/pagination';

@Controller('feedback')
@UseGuards(AuthGuard, RoleGuard)
export class FeedbackController {
  constructor(
    private readonly submitFeedback: SubmitFeedbackCommand,
    private readonly listFeedback: ListFeedbackForTriageQuery,
    private readonly updateFeedbackStatus: UpdateFeedbackStatusCommand,
  ) {}

  @Version('1')
  @Post()
  @AppResponse('FEEDBACK_SUBMITTED')
  submit(
    @User() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() input: SubmitFeedbackDTO,
  ) {
    return this.submitFeedback.execute(user.sub, input, idempotencyKey);
  }

  @Version('1')
  @Get('administration')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('FEEDBACK_ADMINISTRATION_LISTED', FeedbackDTO, { paginated: true })
  listForAdministration(@Query() query: ListFeedbackDTO): Promise<Paginated<FeedbackDTO>> {
    return this.listFeedback.execute(query);
  }

  @Version('1')
  @Patch(':id/status')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('FEEDBACK_STATUS_UPDATED', FeedbackDTO)
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateFeedbackStatusDTO): Promise<FeedbackDTO> {
    return this.updateFeedbackStatus.execute(id, payload);
  }
}
