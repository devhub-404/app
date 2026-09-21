import { Injectable } from '@nestjs/common';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';
import { News } from '@/modules/news/domain/news';
import { SaveNewsDraftInputDTO } from '@/modules/news/application/dtos/in';
import { NewsQueryRepository } from '@/modules/news/application/ports/repositories/news.query.repository';
import { SaveNewsDraftOutputDTO } from '@/modules/news/application/dtos/out';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { AppError } from '@/shared/errors/app-error';
import { MediaServicePort } from '@/modules/media/public';
import { NewsPolicy } from '@/modules/news/application/news.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { resolveUniqueSlug } from '@/shared/kernel/slug/unique-slug';
import { NewsSourceRepository } from '@/modules/news/application/ports/repositories/news-source.repository';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import { canonicalizeHttpUrl } from '@/shared/kernel/url/canonical-http-url';
@Injectable()
export class SaveNewsDraftCommand {
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly newsQueryRepository: NewsQueryRepository,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly mediaService: MediaServicePort,
    private readonly newsPolicy: NewsPolicy,
    private readonly sourceRepository: NewsSourceRepository,
    private readonly resources: ResourceIdentityPort,
  ) {}

  async execute(user: User, payload: SaveNewsDraftInputDTO): Promise<SaveNewsDraftOutputDTO> {
    this.newsPolicy.canManage(user);
    const classification = await this.taxonomyService.validateTags(payload.tagSlugs ?? [], user.sub);

    const newsId = await this.newsRepository.transaction(async (context) => {
      const identity = await this.resources.create('news', context);
      const news = News.create(identity.id, {
        title: payload.title,
        description: payload.description,
        slug: await resolveUniqueSlug(
          payload.title,
          (slug) => this.newsRepository.slugExists(slug, undefined, context),
          80,
          'content',
        ),
        ...(await resolveCoverAsset(this.mediaService, user.sub, payload.coverMediaId)),
        content: payload.content,
        occurredAt: payload.occurredAt ?? null,
        tagSlugs: payload.tagSlugs ?? [],
      });

      return this.newsRepository.create(news, classification, context);
    });
    for (const url of payload.sourceUrls ?? []) await this.sourceRepository.link(newsId, canonicalizeHttpUrl(url));

    return (await this.newsQueryRepository.findById(newsId)) as SaveNewsDraftOutputDTO;
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
