import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Role } from '@/shared/kernel/auth/role';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/shared/nest/decorators/user.decorator';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import {
  ListProjectsDTO,
  PaginatedProjectsDTO,
  ProjectDTO,
  SaveProjectDTO,
  UpdateProjectDTO,
} from '../application/dtos';
import { ListProjectsQuery } from '../application/use-cases/query/list-projects.query';
import { ListMyProjectsQuery } from '../application/use-cases/query/list-my-projects.query';
import { GetProjectBySlugQuery } from '../application/use-cases/query/get-project.query';
import { GetProjectByIdQuery } from '../application/use-cases/query/get-project-by-id.query';
import { CreateProjectCommand } from '../application/use-cases/command/create-project.command';
import { UpdateProjectCommand } from '../application/use-cases/command/update-project.command';
import { PublishProjectCommand } from '../application/use-cases/command/publish-project.command';
import { ArchiveProjectCommand } from '../application/use-cases/command/archive-project.command';
import { UnarchiveProjectCommand } from '../application/use-cases/command/unarchive-project.command';
import { DeleteProjectCommand } from '../application/use-cases/command/delete-project.command';
import { ListProjectsForManagementQuery } from '../application/use-cases/query/list-projects-for-management.query';
@Controller('projects')
@UseGuards(AuthGuard, RoleGuard)
export class ProjectController {
  constructor(
    private readonly listQ: ListProjectsQuery,
    private readonly mineQ: ListMyProjectsQuery,
    private readonly getQ: GetProjectBySlugQuery,
    private readonly getByIdQ: GetProjectByIdQuery,
    private readonly createC: CreateProjectCommand,
    private readonly updateC: UpdateProjectCommand,
    private readonly publishC: PublishProjectCommand,
    private readonly archiveC: ArchiveProjectCommand,
    private readonly unarchiveC: UnarchiveProjectCommand,
    private readonly deleteC: DeleteProjectCommand,
    private readonly managementQ: ListProjectsForManagementQuery,
  ) {}
  @Version('1')
  @Get('administration')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_LISTED', PaginatedProjectsDTO)
  listManagement(@Query() q: ListProjectsDTO) {
    return this.managementQ.execute(q);
  }
  @Version('1') @Get() @Public() @AppResponse('CONTENT_LISTED', PaginatedProjectsDTO) list(
    @Query() q: ListProjectsDTO,
  ) {
    return this.listQ.execute(q);
  }
  @Version('1') @Get('me') @AppResponse('CONTENT_LISTED', PaginatedProjectsDTO) mine(
    @User('id') u: string,
    @Query() q: ListProjectsDTO,
  ) {
    return this.mineQ.execute(u, q);
  }
  @Version('1') @Get(':slug') @Public() @AppResponse('CONTENT_FETCHED', ProjectDTO) get(
    @Param('slug') k: string,
    @User('id') u?: string,
  ) {
    return this.getQ.execute(k, u);
  }
  @Version('1') @Get('id/:id') @Roles([Role.MODERATOR, Role.ADMIN]) @AppResponse('CONTENT_FETCHED', ProjectDTO) getById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getByIdQ.execute(id);
  }
  @Version('1') @Post() @AppResponse('CONTENT_CREATED', ProjectDTO) create(
    @User('id') u: string,
    @Body() b: SaveProjectDTO,
  ) {
    return this.createC.execute(u, b);
  }
  @Version('1') @Patch(':id') @AppResponse('CONTENT_UPDATED', ProjectDTO) update(
    @User('id') u: string,
    @Param('id', ParseUUIDPipe) i: string,
    @Body() b: UpdateProjectDTO,
  ) {
    return this.updateC.execute(u, i, b);
  }
  @Version('1') @Post(':id/publish') @AppResponse('CONTENT_UPDATED', ProjectDTO) publish(
    @User('id') u: string,
    @Param('id', ParseUUIDPipe) i: string,
  ) {
    return this.publishC.execute(u, i);
  }
  @Version('1') @Post(':id/archive') @AppResponse('CONTENT_UPDATED', ProjectDTO) archive(
    @User('id') u: string,
    @Param('id', ParseUUIDPipe) i: string,
  ) {
    return this.archiveC.execute(u, i);
  }
  @Version('1') @Post(':id/unarchive') @AppResponse('CONTENT_UPDATED', ProjectDTO) unarchive(
    @User('id') u: string,
    @Param('id', ParseUUIDPipe) i: string,
  ) {
    return this.unarchiveC.execute(u, i);
  }
  @Version('1') @Delete(':id') @AppResponse('CONTENT_DELETED') remove(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) i: string,
  ) {
    return this.deleteC.execute(user, i);
  }
}
