import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import {
  ArchiveResourceCommand,
  CreateResourceCommand,
  CreateResourceDTO,
  DeleteResourceCommand,
  GetResourceByIdQuery,
  QueryResourceDTO,
  ListResourcesQuery,
  UnarchiveResourceCommand,
  UpdateResourceCommand,
  UpdateResourceDTO,
  ResourceItemDTO,
  SuggestExternalResourceCommand,
  SuggestExternalResourceDTO,
  RejectResourceDTO,
  ApproveExternalResourceSuggestionCommand,
  RejectExternalResourceSuggestionCommand,
  ListPendingExternalResourceSuggestionsQuery,
  ListMyExternalResourceSuggestionsQuery,
  ExternalResourceSuggestionDTO,
  GetResourceForManagementQuery,
  ListResourcesForManagementQuery,
  ApproveExternalResourceSuggestionDTO,
} from '@/modules/external-resource/application';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { User } from '@/modules/auth/public/http';
import { Paginated } from '@/shared/kernel/pagination';
import { Role } from '@/shared/kernel/auth/role';
import { Public } from '@/shared/nest/decorators/public';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';

@Controller('resources')
@UseGuards(AuthGuard, RoleGuard)
export class ResourcesController {
  constructor(
    private readonly searchResourcesQuery: ListResourcesQuery,
    private readonly getResourceQuery: GetResourceByIdQuery,
    private readonly createResourceCommand: CreateResourceCommand,
    private readonly updateResourceCommand: UpdateResourceCommand,
    private readonly archiveResourceCommand: ArchiveResourceCommand,
    private readonly unarchiveResourceCommand: UnarchiveResourceCommand,
    private readonly deleteResourceCommand: DeleteResourceCommand,
    private readonly suggestExternalResourceCommand: SuggestExternalResourceCommand,
    private readonly approveExternalResourceSuggestionCommand: ApproveExternalResourceSuggestionCommand,
    private readonly rejectExternalResourceSuggestionCommand: RejectExternalResourceSuggestionCommand,
    private readonly listPendingExternalResourceSuggestionsQuery: ListPendingExternalResourceSuggestionsQuery,
    private readonly listMyExternalResourceSuggestionsQuery: ListMyExternalResourceSuggestionsQuery,
    private readonly getResourceForManagementQuery: GetResourceForManagementQuery,
    private readonly listResourcesForManagementQuery: ListResourcesForManagementQuery,
  ) {}

  @Version('1')
  @Get()
  @Public()
  @Header('Cache-Control', 'public, max-age=1800')
  @AppResponse('RESOURCES_LISTED', ResourceItemDTO, { paginated: true })
  async list(@Query() query: QueryResourceDTO): Promise<Paginated<ResourceItemDTO>> {
    return await this.searchResourcesQuery.execute(query);
  }

  @Version('1')
  @Get('suggestions/pending')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('PENDING_EXTERNAL_RESOURCE_SUGGESTIONS_LISTED', ExternalResourceSuggestionDTO, { paginated: true })
  async listPendingSuggestions(@Query() query: QueryResourceDTO) {
    return await this.listPendingExternalResourceSuggestionsQuery.execute(query);
  }

  @Version('1')
  @Get('suggestions/me')
  @AppResponse('EXTERNAL_RESOURCE_SUGGESTIONS_LISTED', ExternalResourceSuggestionDTO, { paginated: true })
  async listMySuggestions(@User('id') userId: string, @Query() query: QueryResourceDTO) {
    return await this.listMyExternalResourceSuggestionsQuery.execute(userId, query);
  }

  @Version('1')
  @Get('administration')
  @Roles([Role.CURATOR, Role.MODERATOR, Role.ADMIN])
  @AppResponse('RESOURCES_LISTED', ResourceItemDTO, { paginated: true })
  async listForManagement(@Query() query: QueryResourceDTO): Promise<Paginated<ResourceItemDTO>> {
    return await this.listResourcesForManagementQuery.execute(query);
  }

  @Version('1')
  @Get('id/:id')
  @Roles([Role.CURATOR, Role.MODERATOR, Role.ADMIN])
  @AppResponse('RESOURCE_RETRIEVED', ResourceItemDTO)
  async getForManagement(@Param('id', ParseUUIDPipe) id: string): Promise<ResourceItemDTO> {
    return await this.getResourceForManagementQuery.execute(id);
  }

  @Version('1')
  @Get(':id')
  @Public()
  @AppResponse('RESOURCE_RETRIEVED', ResourceItemDTO)
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getResourceQuery.execute(id);
  }

  @Version('1')
  @Post()
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('RESOURCE_CREATED', ResourceItemDTO)
  async create(@User() user: AuthenticatedUser, @Body() payload: CreateResourceDTO): Promise<ResourceItemDTO> {
    return await this.createResourceCommand.execute(user, payload);
  }

  @Version('1')
  @Post('suggestions')
  @AppResponse('EXTERNAL_RESOURCE_SUGGESTION_CREATED', ExternalResourceSuggestionDTO)
  async suggest(
    @User('id') userId: string,
    @Body() payload: SuggestExternalResourceDTO,
  ): Promise<ExternalResourceSuggestionDTO> {
    return await this.suggestExternalResourceCommand.execute(userId, payload);
  }

  @Version('1')
  @Post('suggestions/:id/accept')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('EXTERNAL_RESOURCE_SUGGESTION_APPROVED')
  async approveSuggestion(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: ApproveExternalResourceSuggestionDTO,
  ): Promise<void> {
    await this.approveExternalResourceSuggestionCommand.execute(user, id, payload);
  }

  @Version('1')
  @Post('suggestions/:id/reject')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('EXTERNAL_RESOURCE_SUGGESTION_REJECTED')
  async rejectSuggestion(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: RejectResourceDTO,
  ): Promise<void> {
    await this.rejectExternalResourceSuggestionCommand.execute(user, id, payload.decisionNote);
  }

  @Version('1')
  @Patch(':id')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('RESOURCE_UPDATED')
  async update(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateResourceDTO,
  ) {
    await this.updateResourceCommand.execute(user, id, payload);
  }

  @Version('1')
  @Post(':id/archive')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('RESOURCE_ARCHIVED')
  async archive(@User() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.archiveResourceCommand.execute(user, id);
  }

  @Version('1')
  @Post(':id/unarchive')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('RESOURCE_UNARCHIVED')
  async unarchive(@User() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.unarchiveResourceCommand.execute(user, id);
  }

  @Version('1')
  @Delete(':id')
  @Roles([Role.ADMIN])
  @AppResponse('RESOURCE_DELETED')
  async delete(@User() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteResourceCommand.execute(user, id);
  }
}
