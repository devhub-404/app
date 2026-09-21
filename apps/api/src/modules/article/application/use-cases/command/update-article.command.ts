import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { UpdateArticleDTO } from '@/modules/article/application/dtos/in';
import { ArticleRepository } from '@/modules/article/application/ports/repositories/article.repository';
import { ArticlePolicy } from '@/modules/article/application/article.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { MediaServicePort } from '@/modules/media/public';
import { applyMarkdownPatch } from '@/shared/kernel/text/markdown-patch';

@Injectable()
export class UpdateArticleCommand {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articlePolicy: ArticlePolicy,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly mediaService: MediaServicePort,
  ) {}

  async execute(user: User, id: string, payload: UpdateArticleDTO): Promise<void> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new AppError('ARTICLE_NOT_FOUND');
    }

    this.articlePolicy.canUpdate(user, article.authorId);

    const expectedContentVersion = article.contentVersion;
    if (payload.contentPatch !== undefined) {
      if (!payload.baseContentVersion) throw new AppError('ARTICLE_CONTENT_PATCH_INVALID');
      if (payload.baseContentVersion !== article.contentVersion) {
        throw new AppError('ARTICLE_CONTENT_CONFLICT', {
          content: article.content,
          contentVersion: article.contentVersion,
        });
      }
      const nextContent = applyMarkdownPatch(article.content, payload.contentPatch);
      if (nextContent === null) throw new AppError('ARTICLE_CONTENT_PATCH_INVALID');
      article.applyContent(nextContent);
    }

    const classification = payload.tagSlugs
      ? await this.taxonomyService.validateTags(payload.tagSlugs, user.sub)
      : undefined;

    const nextTagSlugs = payload.tagSlugs ?? (await this.taxonomyService.getResourceTagSlugs(article.id));
    const previousCoverMediaId = article.coverMediaId;

    const metadata = { ...payload };
    delete metadata.contentPatch;
    delete metadata.baseContentVersion;
    article.update({
      ...metadata,
      tagSlugs: nextTagSlugs,
      ...(await resolveCoverAsset(this.mediaService, user.sub, payload.coverMediaId)),
    });
    const saved = await this.articleRepository.save(article, classification, expectedContentVersion);
    if (expectedContentVersion !== undefined && !saved) {
      const current = await this.articleRepository.findById(id);

      throw new AppError('ARTICLE_CONTENT_CONFLICT', {
        content: current?.content ?? '',
        contentVersion: current?.contentVersion ?? expectedContentVersion,
      });
    }
    if (!saved) throw new AppError('ARTICLE_INVALID_STATUS');
    if (payload.coverMediaId !== undefined && previousCoverMediaId && previousCoverMediaId !== article.coverMediaId) {
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
