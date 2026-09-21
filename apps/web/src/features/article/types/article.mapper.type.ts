import type {
  ArticleAuthor,
  ArticleContentDTO,
  ArticleDetails,
  ArticleDTO,
  ArticleItem,
  ArticleItemDTO,
} from '@/features/article/types/article.type.ts';

function authorOf(dto: ArticleItemDTO): ArticleAuthor {
  return dto.author ?? { username: 'unknown', displayName: 'Unknown', avatarUrl: '' };
}

export function toArticleItem(dto: ArticleItemDTO): ArticleItem {
  return {
    ...dto,
    author: authorOf(dto),
    tags: dto.tags ?? [],
    votes: Number(dto.votes ?? 0),
  };
}

export function toArticleDetails(article: ArticleDTO, content: ArticleContentDTO): ArticleDetails {
  return {
    ...toArticleItem(article),
    content: content.content,
    contentVersion: content.contentVersion ?? 1,
  };
}
