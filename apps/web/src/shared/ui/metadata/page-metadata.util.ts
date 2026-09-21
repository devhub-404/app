import type { PageMetadata } from './page-metadata.type.ts';

export function createPageMetadata(metadata: PageMetadata): PageMetadata {
  return {
    ...metadata,
    author: metadata.author?.trim() || undefined,
    title: metadata.title.trim(),
    description: metadata.description.trim(),
    keywords: metadata.keywords.trim(),
  };
}
