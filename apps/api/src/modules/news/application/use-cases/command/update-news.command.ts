import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';
import { UpdateNewsDTO } from '@/modules/news/application/dtos/in';
import { NewsPolicy } from '@/modules/news/application/news.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { MediaServicePort } from '@/modules/media/public';
import { applyMarkdownPatch } from '@/shared/kernel/text/markdown-patch';

@Injectable()
export class UpdateNewsCommand {
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly newsPolicy: NewsPolicy,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly mediaService: MediaServicePort,
  ) {}

  async execute(user: User, id: string, payload: UpdateNewsDTO): Promise<void> {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw new AppError('NEWS_NOT_FOUND');
    }

    this.newsPolicy.canManage(user);

    const expectedContentVersion = news.contentVersion;
    if (payload.contentPatch !== undefined) {
      if (!payload.baseContentVersion || payload.baseContentVersion !== news.contentVersion) {
        throw new AppError('NEWS_CONTENT_CONFLICT', {
          content: news.content,
          contentVersion: news.contentVersion,
        });
      }
      const nextContent = applyMarkdownPatch(news.content, payload.contentPatch);
      if (nextContent === null) throw new AppError('NEWS_CONTENT_PATCH_INVALID');
      news.applyContent(nextContent);
    }

    const classification = payload.tagSlugs
      ? await this.taxonomyService.validateTags(payload.tagSlugs, user.sub)
      : undefined;

    const nextTagSlugs = payload.tagSlugs ?? (await this.taxonomyService.getResourceTagSlugs(news.id));
    const previousCoverMediaId = news.coverMediaId;

    const metadata = { ...payload };
    delete metadata.contentPatch;
    delete metadata.baseContentVersion;
    news.update({
      ...metadata,
      tagSlugs: nextTagSlugs,
      ...(await resolveCoverAsset(this.mediaService, user.sub, payload.coverMediaId)),
    });

    const saved = await this.newsRepository.save(news, classification, expectedContentVersion);
    if (expectedContentVersion !== undefined && !saved) {
      const current = await this.newsRepository.findById(id);

      throw new AppError('NEWS_CONTENT_CONFLICT', {
        content: current?.content ?? '',
        contentVersion: current?.contentVersion ?? expectedContentVersion,
      });
    }
    if (!saved) throw new AppError('NEWS_INVALID_STATUS');
    if (payload.coverMediaId !== undefined && previousCoverMediaId && previousCoverMediaId !== news.coverMediaId) {
      await this.mediaService.deleteImage({ ownerId: user.sub, mediaId: previousCoverMediaId });
    }
  }
}

async function resolveCoverAsset(
  mediaService: MediaServicePort,
  ownerId: string,
  coverMediaId?: string | null,
): Promise<{ coverImageUrl?: string | null; coverMediaId?: string | null } | undefined> {
  if (coverMediaId === undefined) {
    return undefined;
  }

  if (coverMediaId === null || coverMediaId.length === 0) {
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
