import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/shared/nest/decorators/user.decorator';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import {
  AddOrganizationMemberDTO,
  ChangeOrganizationMemberRoleDTO,
  CreateOrganizationDTO,
  ListOrganizationsDTO,
  OrganizationDTO,
  MyOrganizationDTO,
  OrganizationMembershipDTO,
  PaginatedOrganizationsDTO,
  UpdateOrganizationDTO,
} from '../application/dtos';
import {
  AddOrganizationMemberCommand,
  ArchiveOrganizationCommand,
  ChangeOrganizationMemberRoleCommand,
  CreateOrganizationCommand,
  DeleteOrganizationCommand,
  LeaveOrganizationCommand,
  RemoveOrganizationMemberCommand,
  UnarchiveOrganizationCommand,
  UpdateOrganizationCommand,
} from '../application/use-cases/command';
import {
  GetOrganizationBySlugQuery,
  ListMyOrganizationsQuery,
  ListOrganizationMembersQuery,
  ListOrganizationsQuery,
} from '../application/use-cases/query';

@Controller('organizations')
@UseGuards(AuthGuard)
export class OrganizationController {
  constructor(
    private readonly listQ: ListOrganizationsQuery,
    private readonly getQ: GetOrganizationBySlugQuery,
    private readonly mineQ: ListMyOrganizationsQuery,
    private readonly membersQ: ListOrganizationMembersQuery,
    private readonly createC: CreateOrganizationCommand,
    private readonly deleteC: DeleteOrganizationCommand,
    private readonly updateC: UpdateOrganizationCommand,
    private readonly archiveC: ArchiveOrganizationCommand,
    private readonly unarchiveC: UnarchiveOrganizationCommand,
    private readonly addMemberC: AddOrganizationMemberCommand,
    private readonly changeRoleC: ChangeOrganizationMemberRoleCommand,
    private readonly removeMemberC: RemoveOrganizationMemberCommand,
    private readonly leaveC: LeaveOrganizationCommand,
  ) {}

  @Version('1')
  @Get()
  @Public()
  @AppResponse('CONTENT_LISTED', PaginatedOrganizationsDTO)
  list(@Query() query: ListOrganizationsDTO) {
    return this.listQ.execute(query);
  }

  @Version('1')
  @Post()
  @AppResponse('CONTENT_CREATED', OrganizationDTO)
  create(@User('id') accountId: string, @Body() input: CreateOrganizationDTO) {
    return this.createC.execute(accountId, input);
  }

  @Version('1')
  @Get('me')
  @AppResponse('CONTENT_LISTED', MyOrganizationDTO, { isArray: true })
  mine(@User('id') accountId: string) {
    return this.mineQ.execute(accountId);
  }

  @Version('1')
  @Get(':slug')
  @Public()
  @AppResponse('CONTENT_FETCHED', OrganizationDTO)
  get(@Param('slug') slug: string) {
    return this.getQ.execute(slug);
  }

  @Version('1')
  @Patch(':id')
  @AppResponse('CONTENT_UPDATED', OrganizationDTO)
  update(@User('id') accountId: string, @Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateOrganizationDTO) {
    return this.updateC.execute(accountId, id, input);
  }

  @Version('1')
  @Delete(':id')
  @AppResponse('CONTENT_DELETED')
  delete(@User('id') accountId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.deleteC.execute(accountId, id);
  }

  @Version('1')
  @Post(':id/archive')
  @AppResponse('CONTENT_UPDATED', OrganizationDTO)
  archive(@User('id') accountId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.archiveC.execute(accountId, id);
  }

  @Version('1')
  @Post(':id/unarchive')
  @AppResponse('CONTENT_UPDATED', OrganizationDTO)
  unarchive(@User('id') accountId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.unarchiveC.execute(accountId, id);
  }

  @Version('1')
  @Get(':id/members')
  @AppResponse('CONTENT_LISTED', OrganizationMembershipDTO, { isArray: true })
  members(@User('id') accountId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.membersQ.execute(accountId, id);
  }

  @Version('1')
  @Post(':id/members')
  @AppResponse('CONTENT_CREATED', OrganizationMembershipDTO)
  addMember(
    @User('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: AddOrganizationMemberDTO,
  ) {
    return this.addMemberC.execute(actorId, id, input);
  }

  @Version('1')
  @Patch(':id/members/:accountId')
  @AppResponse('CONTENT_UPDATED', OrganizationMembershipDTO)
  changeRole(
    @User('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Body() input: ChangeOrganizationMemberRoleDTO,
  ) {
    return this.changeRoleC.execute(actorId, id, accountId, input);
  }

  @Version('1')
  @Delete(':id/members/:accountId')
  @AppResponse('CONTENT_DELETED')
  removeMember(
    @User('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.removeMemberC.execute(actorId, id, accountId);
  }

  @Version('1')
  @Post(':id/leave')
  @AppResponse('CONTENT_DELETED')
  leave(@User('id') accountId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.leaveC.execute(accountId, id);
  }
}
