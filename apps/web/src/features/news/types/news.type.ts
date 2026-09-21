import type { NewsDTO, NewsDetails, NewsItem, NewsItemDTO } from '@/features/news/types/news.dto.type.ts';
export { canEditNews, canDeleteNews, canPublishNews, canArchiveNews, canUnarchiveNews } from '../access/news.access.ts';
export {
  isNewsPublic,
  isNewsPublishable,
  isNewsArchivable,
  isNewsUnarchivable,
  type NewsLifecycleState,
} from '../domain/news.domain.ts';
export function toNewsItem(dto: NewsItemDTO | NewsDTO): NewsItem {
  return { ...dto, tags: dto.tags ?? [] };
}
export function toNewsDetails(dto: NewsDTO): NewsDetails {
  return {
    ...dto,
    content: dto.content ?? '',
    contentVersion: dto.contentVersion ?? 1,
    tags: dto.tags ?? [],
  };
}
