import { Paginated } from '@/shared/kernel/pagination';
import { ArticleItemDTO } from '@/modules/article/application/dtos/out';
import type { ArticleSearchCriteria } from './article-search.criteria';

export type ArticleDetailReadModel = {
  id: string;
  authorId: string | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  authorAvatarObjectKey: string | null;
  title: string;
  description: string;
  slug: string;
  coverObjectKey: string | null;
  tags: Array<{ name: string; slug: string }>;
  readingTimeMinutes: number;
  votes: number;
  views: number;
  commentCount: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  hiddenAt: string | null;
  hideReason: string | null;
  deletedAt: string | null;
  updatedAt: string;
};

export type ArticleContentReadModel = {
  id: string;
  authorId: string | null;
  content: string;
  contentVersion: number;
  status: 'draft' | 'published' | 'archived';
  hiddenAt: string | null;
  deletedAt: string | null;
};

export type ArticleOperationalStateReadModel = {
  id: string;
  authorId: string | null;
  status: 'draft' | 'published' | 'archived';
  commentsEnabled: boolean;
  hiddenAt: string | null;
  deletedAt: string | null;
  updatedAt: string;
};

export type ArticlePublishingDataReadModel = {
  id: string;
  authorId: string | null;
  title: string;
  slug: string;
  coverObjectKey: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  deletedAt: string | null;
  updatedAt: string;
};

export type ArticlePopularTag = { slug: string; name: string; articleCount: number };

export abstract class ArticleQueryRepository {
  abstract findById(id: string): Promise<ArticleDetailReadModel | null>;
  abstract findBySlug(slug: string): Promise<ArticleDetailReadModel | null>;
  abstract findContentById(id: string): Promise<ArticleContentReadModel | null>;
  abstract findContentBySlug(slug: string): Promise<ArticleContentReadModel | null>;
  abstract findOperationalStateById(id: string): Promise<ArticleOperationalStateReadModel | null>;
  abstract findPublishingDataById(id: string): Promise<ArticlePublishingDataReadModel | null>;
  abstract search(filter: ArticleSearchCriteria): Promise<Paginated<ArticleItemDTO>>;
  abstract searchByAuthor(authorId: string, filter: ArticleSearchCriteria): Promise<Paginated<ArticleItemDTO>>;
  abstract searchForModeration(filter: ArticleSearchCriteria): Promise<Paginated<ArticleItemDTO>>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
  abstract listPopularTags(limit?: number): Promise<ArticlePopularTag[]>;
}
