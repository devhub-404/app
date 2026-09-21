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
  ArticleDTO,
  SaveArticleDraftOutputDTO,
  ArticleItemDTO,
  ArticlePublishInputDTO,
  SaveArticleDraftCommand,
  SaveArticleDraftInputDTO,
  DeleteArticleCommand,
  GetArticleBySlugQuery,
  GetArticleByIdQuery,
  GetArticleContentByIdQuery,
  GetArticleContentBySlugQuery,
  ArticleContentDTO,
  PublishArticleCommand,
  ArchiveArticleCommand,
  UnarchiveArticleCommand,
  QueryArticleDTO,
  ListArticlesQuery,
  ListArticlesForModerationQuery,
  ListMyArticlesQuery,
  UpdateArticleCommand,
  UpdateArticleDTO,
  SetArticleCommentsEnabledCommand,
  SetArticleCommentsEnabledDTO,
  ListArticleRssQuery,
  ArticlePopularTagDTO,
  ListPopularArticleTagsQuery,
} from '@/modules/article/application';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Role } from '@/shared/kernel/auth/role';
import { User } from '@/modules/auth/public/http';
import { Paginated } from '@/shared/kernel/pagination';
import { Public } from '@/shared/nest/decorators/public';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';
import { env } from '@/app/config/env';
import type { FastifyReply } from 'fastify';

@Controller('articles')
@UseGuards(AuthGuard, RoleGuard)
export class ArticlesController {
  constructor(
    private readonly searchArticlesQuery: ListArticlesQuery,
    private readonly getArticleQuery: GetArticleByIdQuery,
    private readonly getArticleBySlugQuery: GetArticleBySlugQuery,
    private readonly getArticleContentByIdQuery: GetArticleContentByIdQuery,
    private readonly getArticleContentBySlugQuery: GetArticleContentBySlugQuery,
    private readonly searchUserArticleQuery: ListMyArticlesQuery,
    private readonly listArticlesForModerationQuery: ListArticlesForModerationQuery,
    private readonly saveArticleDraftCommand: SaveArticleDraftCommand,
    private readonly publishArticleCommand: PublishArticleCommand,
    private readonly archiveArticleCommand: ArchiveArticleCommand,
    private readonly unarchiveArticleCommand: UnarchiveArticleCommand,
    private readonly updateArticleCommand: UpdateArticleCommand,
    private readonly setArticleCommentsEnabledCommand: SetArticleCommentsEnabledCommand,
    private readonly deleteArticleCommand: DeleteArticleCommand,
    private readonly listArticleRssQuery: ListArticleRssQuery,
    private readonly listPopularArticleTagsQuery: ListPopularArticleTagsQuery,
  ) {}

  @Version('1')
  @Get()
  @Public()
  @Header('Cache-Control', 'public, max-age=1800')
  @AppResponse('ARTICLE_LISTED', ArticleItemDTO, { paginated: true })
  async list(@Query() query: QueryArticleDTO): Promise<Paginated<ArticleItemDTO>> {
    return this.searchArticlesQuery.execute(query);
  }

  @Version('1')
  @Get('tags/popular')
  @Public()
  @Header('Cache-Control', 'public, max-age=1800')
  @AppResponse('ARTICLE_LISTED', ArticlePopularTagDTO, { isArray: true })
  async listPopularTags(): Promise<ArticlePopularTagDTO[]> {
    return this.listPopularArticleTagsQuery.execute();
  }

  @Version('1')
  @Get('rss')
  @Public()
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  async rss(@Res() reply: FastifyReply): Promise<void> {
    const items = await this.listArticleRssQuery.execute();
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0"><channel>',
      `<title>${escapeXml('DevHub Articles')}</title>`,
      `<link>${escapeXml(`${env.siteUrl}/articles`)}</link>`,
      `<description>${escapeXml('Artigos públicos do DevHub')}</description>`,
      ...items.map(
        (item) =>
          `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(`${env.siteUrl}/articles/${item.slug}`)}</link><guid isPermaLink="true">${escapeXml(`${env.siteUrl}/articles/${item.slug}`)}</guid><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate><description>${escapeXml(item.description)}</description></item>`,
      ),
      '</channel></rss>',
    ].join('');
    reply.send(xml);
  }

  @Version('1')
  @Get('me')
  @AppResponse('ARTICLE_LISTED', ArticleItemDTO, { paginated: true })
  async listOwn(@User('id') userId: string, @Query() query: QueryArticleDTO): Promise<Paginated<ArticleItemDTO>> {
    return this.searchUserArticleQuery.execute(userId, query);
  }

  @Version('1')
  @Get('administration')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('ARTICLE_LISTED', ArticleItemDTO, { paginated: true })
  async listForModeration(@Query() query: QueryArticleDTO): Promise<Paginated<ArticleItemDTO>> {
    return this.listArticlesForModerationQuery.execute(query);
  }

  @Version('1')
  @Get('id/:id')
  @AppResponse('ARTICLE_FETCHED', ArticleDTO)
  async getById(@User() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<ArticleDTO> {
    return this.getArticleQuery.execute(user.sub, id, user.role);
  }

  @Version('1')
  @Get('id/:id/content')
  @AppResponse('ARTICLE_FETCHED', ArticleContentDTO)
  async getContentById(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArticleContentDTO> {
    return this.getArticleContentByIdQuery.execute(user.sub, id, user.role);
  }

  @Version('1')
  @Get(':slug')
  @Public()
  @Header('Cache-Control', 'public, max-age=1800')
  @AppResponse('ARTICLE_FETCHED', ArticleDTO)
  async getBySlug(@User('id') userId: string | undefined, @Param('slug') slug: string): Promise<ArticleDTO> {
    return this.getArticleBySlugQuery.execute(userId ?? '', slug);
  }

  @Version('1')
  @Get(':slug/content')
  @Public()
  @Header('Cache-Control', 'public, max-age=1800')
  @AppResponse('ARTICLE_FETCHED', ArticleContentDTO)
  async getContentBySlug(@Param('slug') slug: string): Promise<ArticleContentDTO> {
    return this.getArticleContentBySlugQuery.execute(slug);
  }

  @Version('1')
  @Post('drafts')
  @AppResponse('ARTICLE_DRAFT_SAVED', SaveArticleDraftOutputDTO)
  async saveDraft(
    @User() user: AuthenticatedUser,
    @Body() payload: SaveArticleDraftInputDTO,
  ): Promise<SaveArticleDraftOutputDTO> {
    return this.saveArticleDraftCommand.execute(user, payload);
  }

  @Version('1')
  @Post(':id/publish')
  @AppResponse('ARTICLE_PUBLISHED')
  async publish(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: ArticlePublishInputDTO,
  ): Promise<void> {
    await this.publishArticleCommand.execute(user, id, payload);
  }

  @Version('1')
  @Post(':id/archive')
  @AppResponse('ARTICLE_ARCHIVED')
  async archive(@User() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.archiveArticleCommand.execute(user, id);
  }

  @Version('1')
  @Post(':id/unarchive')
  @AppResponse('ARTICLE_UNARCHIVED')
  async unarchive(@User() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.unarchiveArticleCommand.execute(user, id);
  }

  @Version('1')
  @Patch(':id/comments/settings')
  @AppResponse('ARTICLE_COMMENTS_SETTINGS_UPDATED')
  async setCommentsEnabled(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: SetArticleCommentsEnabledDTO,
  ): Promise<void> {
    await this.setArticleCommentsEnabledCommand.execute(user, id, payload.enabled);
  }

  @Version('1')
  @Patch(':id')
  @AppResponse('ARTICLE_UPDATED')
  async update(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateArticleDTO,
  ): Promise<void> {
    await this.updateArticleCommand.execute(user, id, payload);
  }

  @Version('1')
  @Delete(':id')
  @AppResponse('ARTICLE_DELETED')
  async delete(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteArticleCommand.execute(user, id);
  }
}

function escapeXml(value: string): string {
  return value.replace(
    /[<>&']/g,
    (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;' })[character]!,
  );
}
