import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import {
  CreateTagDTO,
  MergeTagsDTO,
  QueryTagDTO,
  ResolveTagQueryDTO,
  UpdateTagDTO,
  CreateTagAliasDTO,
  QueryTagAliasesDTO,
  QueryTagIdentityTermsDTO,
  SetTagIdentityTermDTO,
} from '@/modules/taxonomy/application/tag/dtos/in';
import { TagDTO, TagAliasDTO, TagIdentityTermDTO } from '@/modules/taxonomy/application/tag/dtos/out';
import { CreateTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/create-tag.command';
import { DeleteTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag.command';
import { MergeTagsCommand } from '@/modules/taxonomy/application/tag/use-cases/command/merge-tags.command';
import { ResolveTagQuery } from '@/modules/taxonomy/application/tag/use-cases/query/resolve-tag.query';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { User } from '@/modules/auth/public/http';
import { UpdateTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/update-tag.command';
import { SearchTagsQuery } from '@/modules/taxonomy/application/tag/use-cases/query/search-tags.query';
import { SearchTagsPageQuery } from '@/modules/taxonomy/application/tag/use-cases/query/search-tags-page.query';
import { Public } from '@/shared/nest/decorators/public';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { Role } from '@/shared/kernel/auth/role';
import { Paginated } from '@/shared/kernel/pagination';
import { CreateTagAliasCommand } from '@/modules/taxonomy/application/tag/use-cases/command/create-tag-alias.command';
import { DeleteTagAliasCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag-alias.command';
import { SetTagIdentityTermCommand } from '@/modules/taxonomy/application/tag/use-cases/command/set-tag-identity-term.command';
import { DeleteTagIdentityTermCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag-identity-term.command';
import { ListTagAliasesQuery } from '@/modules/taxonomy/application/tag/use-cases/query/list-tag-aliases.query';
import { ListTagIdentityTermsQuery } from '@/modules/taxonomy/application/tag/use-cases/query/list-tag-identity-terms.query';
import { ArchiveTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/archive-tag.command';
import { UnarchiveTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/unarchive-tag.command';

@Controller('taxonomy/tags')
@UseGuards(AuthGuard, RoleGuard)
export class TaxonomyTagsController {
  constructor(
    private readonly searchTagsQuery: SearchTagsQuery,
    private readonly searchTagsPageQuery: SearchTagsPageQuery,
    private readonly createTagCommand: CreateTagCommand,
    private readonly updateTagCommand: UpdateTagCommand,
    private readonly deleteTagCommand: DeleteTagCommand,
    private readonly mergeTagsCommand: MergeTagsCommand,
    private readonly resolveTagQuery: ResolveTagQuery,
    private readonly createTagAliasCommand: CreateTagAliasCommand,
    private readonly deleteTagAliasCommand: DeleteTagAliasCommand,
    private readonly setTagIdentityTermCommand: SetTagIdentityTermCommand,
    private readonly deleteTagIdentityTermCommand: DeleteTagIdentityTermCommand,
    private readonly listTagAliasesQuery: ListTagAliasesQuery,
    private readonly listTagIdentityTermsQuery: ListTagIdentityTermsQuery,
    private readonly archiveTagCommand: ArchiveTagCommand,
    private readonly unarchiveTagCommand: UnarchiveTagCommand,
  ) {}

  @Version('1')
  @Get('aliases')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('TAG_ALIASES_LISTED', TagAliasDTO, { isArray: true })
  aliases(@Query() query: QueryTagAliasesDTO): Promise<TagAliasDTO[]> {
    return this.listTagAliasesQuery.execute(query.tagId);
  }

  @Version('1')
  @Post('aliases')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_ALIAS_CREATED', TagAliasDTO)
  createAlias(@Body() payload: CreateTagAliasDTO): Promise<TagAliasDTO> {
    return this.createTagAliasCommand.execute(payload);
  }

  @Version('1')
  @Delete('aliases/:id')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_ALIAS_DELETED')
  async deleteAlias(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteTagAliasCommand.execute(id);
  }

  @Version('1')
  @Get('identity-terms')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_IDENTITY_TERMS_LISTED', TagIdentityTermDTO, { isArray: true })
  identityTerms(@Query() query: QueryTagIdentityTermsDTO): Promise<TagIdentityTermDTO[]> {
    return this.listTagIdentityTermsQuery.execute(query.kind);
  }

  @Version('1')
  @Put('identity-terms')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_IDENTITY_TERM_SET', TagIdentityTermDTO)
  setIdentityTerm(@Body() payload: SetTagIdentityTermDTO): Promise<TagIdentityTermDTO> {
    return this.setTagIdentityTermCommand.execute(payload);
  }

  @Version('1')
  @Delete('identity-terms/:id')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_IDENTITY_TERM_DELETED')
  async deleteIdentityTerm(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteTagIdentityTermCommand.execute(id);
  }

  @Version('1')
  @Get()
  @Public()
  @AppResponse('TAGS_SEARCHED', TagDTO, { isArray: true })
  async list(@Query() query: QueryTagDTO): Promise<TagDTO[]> {
    return await this.searchTagsQuery.execute(query);
  }

  @Version('1')
  @Get('page')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('TAGS_SEARCHED', TagDTO, { paginated: true })
  page(@Query() query: QueryTagDTO): Promise<Paginated<TagDTO>> {
    return this.searchTagsPageQuery.execute(query);
  }

  @Version('1')
  @Get('resolve')
  @Public()
  @AppResponse('TAG_RESOLVED', TagDTO, { nullable: true })
  resolve(@Query() query: ResolveTagQueryDTO) {
    return this.resolveTagQuery.execute(query.value);
  }

  @Version('1')
  @Post()
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('TAG_CREATED', TagDTO)
  async create(@Body() payload: CreateTagDTO): Promise<TagDTO> {
    return await this.createTagCommand.execute(payload);
  }

  @Version('1')
  @Post(':id/archive')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_ARCHIVED')
  archive(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.archiveTagCommand.execute(id);
  }

  @Version('1')
  @Post(':id/unarchive')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_UNARCHIVED')
  unarchive(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.unarchiveTagCommand.execute(id);
  }

  @Version('1')
  @Patch(':id')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_UPDATED')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateTagDTO): Promise<TagDTO> {
    return await this.updateTagCommand.execute(id, payload);
  }

  @Version('1')
  @Delete(':id')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_DELETED')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteTagCommand.execute(id);
  }

  @Version('1')
  @Post('merges')
  @Roles([Role.ADMIN])
  @AppResponse('TAG_MERGED')
  merge(@User() user: AuthenticatedPrincipalDTO, @Body() payload: MergeTagsDTO): Promise<void> {
    return this.mergeTagsCommand.execute(user.sub, payload);
  }
}
