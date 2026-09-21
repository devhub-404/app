import { Inject, Injectable } from '@nestjs/common';
import { ArticleDTO } from '@/modules/article/application/dtos/out';
import { ArticleDetailReadModel } from '@/modules/article/application/ports/repositories/article.query.repository';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';

@Injectable()
export class ArticleDetailProjection {
  constructor(@Inject(MEDIA_CONFIG) private readonly mediaConfig: MediaConfig) {}

  project(article: ArticleDetailReadModel): ArticleDTO {
    return {
      id: article.id,
      authorAccountId: article.authorId,
      author: article.authorId
        ? {
            username: article.authorUsername ?? '',
            displayName: article.authorDisplayName ?? '',
            avatarUrl: resolvePublicUrl(article.authorAvatarObjectKey, this.mediaConfig) ?? '',
          }
        : null,
      title: article.title,
      description: article.description,
      slug: article.slug,
      coverImageUrl: resolvePublicUrl(article.coverObjectKey, this.mediaConfig),
      tags: article.tags,
      readingTimeMinutes: article.readingTimeMinutes,
      votes: Number(article.votes),
      views: Number(article.views),
      commentCount: Number(article.commentCount),
      status: article.status,
      publishedAt: article.publishedAt,
      hiddenAt: article.hiddenAt,
      hideReason: article.hideReason,
      updatedAt: article.updatedAt,
      deletedAt: article.deletedAt,
    };
  }
}

function resolvePublicUrl(objectKey: string | null, config: MediaConfig): string | null {
  if (!objectKey) return null;
  const publicBaseUrl = config.storage.publicBaseUrl;

  return publicBaseUrl ? new URL(objectKey, publicBaseUrl).toString() : null;
}
