export type PublishedContent = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  coverImageUrl: string | null;
  tags: string[];
};

export type ContentPublishedMessage = {
  id: string;
  occurredAt: string;
  event: 'article_published' | 'news_published';
  data: {
    article?: PublishedContent;
    news?: PublishedContent;
  };
};
