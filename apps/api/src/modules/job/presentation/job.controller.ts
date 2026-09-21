import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { LocalRateLimitGuard } from '@/app/runtime/rate-limit';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Role } from '@/shared/kernel/auth/role';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/shared/nest/decorators/user.decorator';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import {
  JobDTO,
  ListJobsDTO,
  PaginatedJobsDTO,
  SaveJobDTO,
  SubmitCommunityJobDTO,
  UpdateJobDTO,
} from '../application/dtos';
import { ListJobsQuery } from '../application/use-cases/query/list-jobs.query';
import { ListMyJobsQuery } from '../application/use-cases/query/list-my-jobs.query';
import { GetJobQuery } from '../application/use-cases/query/get-job.query';
import { CreateJobCommand } from '../application/use-cases/command/create-job.command';
import { UpdateJobCommand } from '../application/use-cases/command/update-job.command';
import { CloseJobCommand } from '../application/use-cases/command/close-job.command';
import { RenewJobCommand } from '../application/use-cases/command/renew-job.command';
import { WithdrawJobCommand } from '../application/use-cases/command/withdraw-job.command';
import { DeleteJobCommand } from '../application/use-cases/command/delete-job.command';
import { ListJobsForManagementQuery } from '../application/use-cases/query/list-jobs-for-management.query';
import { SubmitCommunityJobCommand } from '../application/use-cases/command/submit-community-job.command';
import { AcceptJobSuggestionCommand } from '../application/use-cases/command/accept-job-suggestion.command';
import { RejectJobSuggestionCommand } from '../application/use-cases/command/reject-job-suggestion.command';
import { ListPendingJobSuggestionsQuery } from '../application/use-cases/query/list-pending-job-suggestions.query';
import { ListMyJobSuggestionsQuery } from '../application/use-cases/query/list-my-job-suggestions.query';
import type { AuthenticatedPrincipal } from '@/shared/nest/auth';
@Controller('jobs')
@UseGuards(AuthGuard, RoleGuard)
export class JobController {
  constructor(
    private readonly listQ: ListJobsQuery,
    private readonly mineQ: ListMyJobsQuery,
    private readonly getQ: GetJobQuery,
    private readonly createC: CreateJobCommand,
    private readonly updateC: UpdateJobCommand,
    private readonly closeC: CloseJobCommand,
    private readonly renewC: RenewJobCommand,
    private readonly withdrawC: WithdrawJobCommand,
    private readonly deleteC: DeleteJobCommand,
    private readonly managementQ: ListJobsForManagementQuery,
    private readonly submitC: SubmitCommunityJobCommand,
    private readonly acceptSuggestionC: AcceptJobSuggestionCommand,
    private readonly rejectSuggestionC: RejectJobSuggestionCommand,
    private readonly pendingSuggestionsQ: ListPendingJobSuggestionsQuery,
    private readonly mySuggestionsQ: ListMyJobSuggestionsQuery,
  ) {}
  @Version('1')
  @Get('administration')
  @Roles([Role.CURATOR, Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_LISTED', PaginatedJobsDTO)
  listManagement(@Query() q: ListJobsDTO) {
    return this.managementQ.execute(q);
  }
  @Version('1') @Get() @Public() @AppResponse('CONTENT_LISTED', PaginatedJobsDTO) list(@Query() q: ListJobsDTO) {
    return this.listQ.execute(q);
  }
  @Version('1') @Get('me') @AppResponse('CONTENT_LISTED', PaginatedJobsDTO) mine(
    @User('id') u: string,
    @Query() q: ListJobsDTO,
  ) {
    return this.mineQ.execute(u, q);
  }
  @Version('1') @Get(':id') @Public() @AppResponse('CONTENT_FETCHED', JobDTO) get(
    @Param('id', ParseUUIDPipe) i: string,
    @User('id') u?: string,
  ) {
    return this.getQ.execute(i, u);
  }
  @Version('1') @Post() @UseGuards(LocalRateLimitGuard) @AppResponse('CONTENT_CREATED', JobDTO) create(
    @User('id') u: string,
    @Body() b: SaveJobDTO,
  ) {
    return this.createC.execute(u, b);
  }
  @Version('1') @Post('suggestions') @UseGuards(LocalRateLimitGuard) @AppResponse('CONTENT_CREATED') submit(
    @User('id') u: string,
    @Body() b: SubmitCommunityJobDTO,
  ) {
    return this.submitC.execute(u, b);
  }

  @Version('1') @Get('suggestions/me') @AppResponse('CONTENT_LISTED') mySuggestions(@User('id') u: string) {
    return this.mySuggestionsQ.execute(u);
  }
  @Version('1')
  @Get('suggestions/pending')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('CONTENT_LISTED')
  pendingSuggestions() {
    return this.pendingSuggestionsQ.execute();
  }
  @Version('1')
  @Post('suggestions/:id/accept')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED')
  acceptSuggestion(@User('id') u: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.acceptSuggestionC.execute(u, id);
  }
  @Version('1')
  @Post('suggestions/:id/reject')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED')
  rejectSuggestion(@User('id') u: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.rejectSuggestionC.execute(u, id);
  }

  @Version('1') @Patch(':id') @AppResponse('CONTENT_UPDATED', JobDTO) update(
    @User() u: AuthenticatedPrincipal,
    @Param('id', ParseUUIDPipe) i: string,
    @Body() b: UpdateJobDTO,
  ) {
    return this.updateC.execute(u, i, b);
  }
  @Version('1') @Post(':id/close') @AppResponse('CONTENT_UPDATED', JobDTO) close(
    @User() u: AuthenticatedPrincipal,
    @Param('id', ParseUUIDPipe) i: string,
  ) {
    return this.closeC.execute(u, i);
  }
  @Version('1') @Delete(':id') @AppResponse('CONTENT_DELETED') delete(
    @User() u: AuthenticatedPrincipal,
    @Param('id', ParseUUIDPipe) i: string,
  ) {
    return this.deleteC.execute(u, i);
  }
  @Version('1') @Post(':id/withdraw') @AppResponse('CONTENT_UPDATED', JobDTO) withdraw(
    @User() u: AuthenticatedPrincipal,
    @Param('id', ParseUUIDPipe) i: string,
  ) {
    return this.withdrawC.execute(u, i);
  }
  @Version('1') @Post(':id/renew') @UseGuards(LocalRateLimitGuard) @AppResponse('CONTENT_UPDATED', JobDTO) renew(
    @User() u: AuthenticatedPrincipal,
    @Param('id', ParseUUIDPipe) i: string,
  ) {
    return this.renewC.execute(u, i);
  }
}
