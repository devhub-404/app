import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import {
  ArchiveNewsCommand,
  SaveNewsDraftCommand,
  SaveNewsDraftInputDTO,
  DeleteNewsCommand,
  GetNewsBySlugQuery,
  GetNewsByIdQuery,
  SaveNewsDraftOutputDTO,
  NewsDTO,
  NewsItemDTO,
  PublishNewsCommand,
  QueryNewsDTO,
  ListNewsQuery,
  ListNewsForManagementQuery,
  UnarchiveNewsCommand,
  UpdateNewsCommand,
  UpdateNewsDTO,
  NewsSourceDTO,
  ListPopularNewsSourcesQuery,
  SubmitNewsSuggestionCommand,
  AcceptNewsSuggestionCommand,
  RejectNewsSuggestionCommand,
  SubmitNewsSuggestionDTO,
  AcceptNewsSuggestionDTO,
  NewsSuggestionDTO,
  ListPendingNewsSuggestionsQuery,
  ListMyNewsSuggestionsQuery,
  SetNewsCommentsEnabledCommand,
  SetNewsCommentsEnabledDTO,
  ListNewsRssQuery,
} from '@/modules/news/application';
import { Paginated } from '@/shared/kernel/pagination';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { User } from '@/modules/auth/public/http';
import { Role } from '@/shared/kernel/auth/role';
import { Public } from '@/shared/nest/decorators/public';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';
import { env } from '@/app/config/env';
import type { FastifyReply } from 'fastify';

@Controller('news')
@UseGuards(AuthGuard, RoleGuard)
export class NewsController {
  constructor(
    private readonly listNewsQuery: ListNewsQuery,
    private readonly getNewsQuery: GetNewsByIdQuery,
    private readonly getNewsBySlugQuery: GetNewsBySlugQuery,
    private readonly listNewsForManagementQuery: ListNewsForManagementQuery,
    private readonly saveNewsDraftCommand: SaveNewsDraftCommand,
    private readonly publishNewsCommand: PublishNewsCommand,
    private readonly archiveNewsCommand: ArchiveNewsCommand,
    private readonly unarchiveNewsCommand: UnarchiveNewsCommand,
    private readonly deleteNewsCommand: DeleteNewsCommand,
    private readonly updateNewsCommand: UpdateNewsCommand,
    private readonly setNewsCommentsEnabledCommand: SetNewsCommentsEnabledCommand,
    private readonly listPopularNewsSourcesQuery: ListPopularNewsSourcesQuery,
    private readonly submitNewsSuggestionCommand: SubmitNewsSuggestionCommand,
    private readonly acceptNewsSuggestionCommand: AcceptNewsSuggestionCommand,
    private readonly rejectNewsSuggestionCommand: RejectNewsSuggestionCommand,
    private readonly listPendingNewsSuggestionsQuery: ListPendingNewsSuggestionsQuery,
    private readonly listMyNewsSuggestionsQuery: ListMyNewsSuggestionsQuery,
    private readonly listNewsRssQuery: ListNewsRssQuery,
  ) {}

  @Version('1')
  @Get()
  @Public()
  @Header('Cache-Control', 'public, max-age=1800')
  @AppResponse('NEWS_LISTED', NewsItemDTO, { paginated: true })
  async list(@Query() query: QueryNewsDTO): Promise<Paginated<NewsItemDTO>> {
    return await this.listNewsQuery.execute(query);
  }

  @Version('1')
  @Get('rss')
  @Public()
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  async rss(@Res() reply: FastifyReply): Promise<void> {
    const items = await this.listNewsRssQuery.execute();
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0"><channel>',
      `<title>${escapeXml('DevHub News')}</title>`,
      `<link>${escapeXml(`${env.siteUrl}/news`)}</link>`,
      `<description>${escapeXml('Notícias do ecossistema DevHub')}</description>`,
      ...items.map((item) => {
        const link = `${env.siteUrl}/news/${item.slug}`;

        return `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(link)}</link><guid isPermaLink="true">${escapeXml(link)}</guid><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate><description>${escapeXml(item.description)}</description></item>`;
      }),
      '</channel></rss>',
    ].join('');
    reply.send(xml);
  }

  @Version('1')
  @Get('sources/popular')
  @Public()
  @AppResponse('NEWS_SOURCES_LISTED', NewsSourceDTO, { paginated: false })
  async listPopularSources(): Promise<NewsSourceDTO[]> {
    return await this.listPopularNewsSourcesQuery.execute();
  }

  @Version('1')
  @Post('suggestions')
  @AppResponse('NEWS_SUGGESTION_SUBMITTED', NewsSuggestionDTO)
  async submitSuggestion(
    @User('id') userId: string,
    @Body() payload: SubmitNewsSuggestionDTO,
  ): Promise<NewsSuggestionDTO> {
    return await this.submitNewsSuggestionCommand.execute(userId, payload);
  }

  @Version('1')
  @Get('suggestions/pending')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_SUGGESTIONS_LISTED', NewsSuggestionDTO, { paginated: false })
  async listPendingSuggestions(): Promise<NewsSuggestionDTO[]> {
    return await this.listPendingNewsSuggestionsQuery.execute();
  }

  @Version('1')
  @Get('suggestions/me')
  @AppResponse('NEWS_SUGGESTIONS_LISTED', NewsSuggestionDTO, { paginated: false })
  async listMySuggestions(@User('id') userId: string): Promise<NewsSuggestionDTO[]> {
    return await this.listMyNewsSuggestionsQuery.execute(userId);
  }

  @Version('1')
  @Post('suggestions/:id/accept')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_SUGGESTION_ACCEPTED')
  async acceptSuggestion(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: AcceptNewsSuggestionDTO,
  ): Promise<void> {
    await this.acceptNewsSuggestionCommand.execute(user, id, payload);
  }

  @Version('1')
  @Post('suggestions/:id/reject')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_SUGGESTION_REJECTED')
  async rejectSuggestion(@User() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.rejectNewsSuggestionCommand.execute(user, id);
  }

  @Version('1')
  @Get('administration')
  @Roles([Role.CURATOR, Role.MODERATOR, Role.ADMIN])
  @AppResponse('NEWS_LISTED', NewsItemDTO, { paginated: true })
  async listForManagement(@Query() query: QueryNewsDTO): Promise<Paginated<NewsItemDTO>> {
    return await this.listNewsForManagementQuery.execute(query);
  }

  @Version('1')
  @Get('id/:id')
  @Roles([Role.CURATOR, Role.MODERATOR, Role.ADMIN])
  @AppResponse('NEWS_RETRIEVED', NewsDTO)
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getNewsQuery.execute(id);
  }

  @Version('1')
  @Get(':slug')
  @Public()
  @Header('Cache-Control', 'public, max-age=1800')
  @AppResponse('NEWS_RETRIEVED', NewsDTO)
  async getBySlug(@User('id') userId: string | undefined, @Param('slug') slug: string) {
    return await this.getNewsBySlugQuery.execute(userId ?? null, slug);
  }

  @Version('1')
  @Post('drafts')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_DRAFT_SAVED', SaveNewsDraftOutputDTO)
  async saveDraft(
    @User() user: AuthenticatedUser,
    @Body() payload: SaveNewsDraftInputDTO,
  ): Promise<SaveNewsDraftOutputDTO> {
    return await this.saveNewsDraftCommand.execute(user, payload);
  }

  @Version('1')
  @Post(':id/publish')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_PUBLISHED')
  async publish(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.publishNewsCommand.execute(user, id);
  }

  @Version('1')
  @Post(':id/archive')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_ARCHIVED')
  async archive(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.archiveNewsCommand.execute(user, id);
  }

  @Version('1')
  @Post(':id/unarchive')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_UNARCHIVED')
  async unarchive(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.unarchiveNewsCommand.execute(user, id);
  }

  @Version('1')
  @Patch(':id/comments/settings')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_COMMENTS_SETTINGS_UPDATED')
  async setCommentsEnabled(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: SetNewsCommentsEnabledDTO,
  ): Promise<void> {
    await this.setNewsCommentsEnabledCommand.execute(user, id, payload.enabled);
  }

  @Version('1')
  @Patch(':id')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('NEWS_UPDATED')
  async update(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateNewsDTO,
  ) {
    await this.updateNewsCommand.execute(user, id, payload);
  }

  @Version('1')
  @Delete(':id')
  @Roles([Role.ADMIN])
  @AppResponse('NEWS_DELETED')
  async delete(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteNewsCommand.execute(user, id);
  }
}

function escapeXml(value: string): string {
  return value.replace(
    /[<>&']/g,
    (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;' })[character]!,
  );
}
