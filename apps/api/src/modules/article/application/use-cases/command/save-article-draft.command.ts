import { Injectable } from '@nestjs/common';
import { Article } from '@/modules/article/domain/article';
import { SaveArticleDraftInputDTO } from '@/modules/article/application/dtos/in';
import { ArticleRepository } from '@/modules/article/application/ports/repositories/article.repository';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { SaveArticleDraftOutputDTO } from '@/modules/article/application/dtos/out';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { AppError } from '@/shared/errors/app-error';
import { MediaServicePort } from '@/modules/media/public';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public';
import { resolveUniqueSlug } from '@/shared/kernel/slug/unique-slug';
import { ArticleDetailProjection } from '@/modules/article/application/article-detail-projection';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
@Injectable()
export class SaveArticleDraftCommand {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleQueryRepository: ArticleQueryRepository,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly mediaService: MediaServicePort,
    private readonly accountRestrictionService: ModerationAccountRestrictionPort,
    private readonly articleDetailProjection: ArticleDetailProjection,
    private readonly resources: ResourceIdentityPort,
  ) {}

  async execute(user: User, payload: SaveArticleDraftInputDTO): Promise<SaveArticleDraftOutputDTO> {
    await this.accountRestrictionService.assertAccountCapability(user.sub, 'CONTRIBUTION');

    const classification = await this.taxonomyService.validateTags(payload.tagSlugs ?? [], user.sub);

    const articleId = await this.articleRepository.transaction(async (context) => {
      const identity = await this.resources.create('article', context);
      const article = Article.create(identity.id, {
        authorId: user.sub,
        title: payload.title,
        description: payload.description,
        slug: await resolveUniqueSlug(payload.title, (slug) => this.articleRepository.slugExists(slug), 80, 'content'),
        ...(await resolveCoverAsset(this.mediaService, user.sub, payload.coverMediaId)),
        content: payload.content,
        tagSlugs: payload.tagSlugs ?? [],
      });

      return this.articleRepository.create(article, classification, context);
    });

    const saved = await this.articleQueryRepository.findById(articleId);
    if (!saved) throw new AppError('ARTICLE_NOT_FOUND');

    return this.articleDetailProjection.project(saved);
  }
}

async function resolveCoverAsset(
  mediaService: MediaServicePort,
  ownerId: string,
  coverMediaId?: string | null,
): Promise<{ coverImageUrl: string | null; coverMediaId: string | null }> {
  if (coverMediaId === undefined || coverMediaId === null || coverMediaId.length === 0) {
    return { coverImageUrl: null, coverMediaId: null };
  }

  const asset = await mediaService.confirmImageUpload({
    ownerId,
    purpose: 'content',
    mediaId: coverMediaId,
  });

  if (!asset) {
    throw new AppError('UPLOAD_ASSET_NOT_AVAILABLE');
  }

  return { coverImageUrl: null, coverMediaId: asset.mediaId };
}
