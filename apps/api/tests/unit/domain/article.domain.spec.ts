import { describe, expect, it } from 'vitest';
import { Article, ArticleStatus } from '@/modules/article/domain/article';
import { DomainError } from '@/shared/errors/domain-error';

const publishedAt = '2026-01-01T00:00:00.000Z';

function createArticle(overrides: Partial<Parameters<typeof Article.create>[1]> = {}) {
  return Article.create('article-1', {
    authorId: 'author-1',
    title: 'Article',
    description: 'Article description',
    slug: 'article',
    content: 'Initial content',
    ...overrides,
  });
}

function rehydrateArticle(overrides: Partial<Parameters<typeof Article.rehydrate>[0]> = {}) {
  return Article.rehydrate({
    id: 'article-1',
    authorId: 'author-1',
    title: 'Article',
    description: 'Article description',
    slug: 'article',
    coverImageUrl: null,
    coverMediaId: null,
    content: 'Article content',
    contentVersion: 1,
    readingTimeMinutes: 1,
    status: ArticleStatus.Draft,
    publishedAt: null,
    hiddenAt: null,
    hideReason: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    tagSlugs: [],
    ...overrides,
  });
}

describe('Article domain', () => {
  it('creates a draft with stable authorship and slug', () => {
    const article = createArticle();

    expect(article.authorId).toBe('author-1');
    expect(article.slug).toBe('article');
    expect(article.status).toBe(ArticleStatus.Draft);
    expect(article.publishedAt).toBeNull();
    expect(article.deletedAt).toBeNull();
  });

  it('publishes a draft and records publication time', () => {
    const article = createArticle();

    article.publish(publishedAt);

    expect(article.status).toBe(ArticleStatus.Published);
    expect(article.publishedAt).toBe(publishedAt);
  });

  it('preserves the first publication time when publishing again after archive', () => {
    const article = createArticle({ publish: true, publishedAt });
    article.archive();
    article.publish('2026-02-01T00:00:00.000Z');

    expect(article.status).toBe(ArticleStatus.Published);
    expect(article.publishedAt).toBe(publishedAt);
  });

  it('archives and unarchives a published Article', () => {
    const article = createArticle({ publish: true, publishedAt });

    article.archive();
    expect(article.status).toBe(ArticleStatus.Archived);

    article.unarchive();
    expect(article.status).toBe(ArticleStatus.Published);
    expect(article.publishedAt).toBe(publishedAt);
  });

  it('rejects invalid lifecycle transitions', () => {
    const draft = createArticle();
    expect(() => draft.archive()).toThrowError(new DomainError('ARTICLE_INVALID_STATUS'));
    expect(() => draft.unarchive()).toThrowError(new DomainError('ARTICLE_INVALID_STATUS'));

    const published = createArticle({ publish: true });
    expect(() => published.publish()).toThrowError(new DomainError('ARTICLE_INVALID_STATUS'));

    const archived = createArticle({ publish: true });
    archived.archive();
    expect(() => archived.archive()).toThrowError(new DomainError('ARTICLE_INVALID_STATUS'));
  });

  it('marks public visibility from published, visible and non-deleted state', () => {
    const article = createArticle({ publish: true, publishedAt });

    expect(article.status).toBe(ArticleStatus.Published);
    expect(article.hiddenAt).toBeNull();
    expect(article.deletedAt).toBeNull();

    article.hide('moderation review');
    expect(article.hiddenAt).not.toBeNull();
    expect(article.hideReason).toBe('moderation review');

    article.unhide();
    expect(article.hiddenAt).toBeNull();
    expect(article.hideReason).toBeNull();
  });

  it('allows hiding only a visible published Article and normalizes the reason', () => {
    const article = createArticle({ publish: true, publishedAt });
    article.hide('  policy violation  ');

    expect(article.hideReason).toBe('policy violation');
    expect(() => article.hide('another reason')).toThrowError(new DomainError('ARTICLE_INVALID_STATUS'));

    article.unhide();
    expect(() => article.unhide()).toThrowError(new DomainError('ARTICLE_INVALID_STATUS'));
  });

  it('ART-RN-005 — keeps author editorial transitions available while hidden', () => {
    const article = createArticle({ publish: true, publishedAt });
    article.hide('moderation review');

    article.archive();
    article.publish();
    article.archive();
    article.unarchive();
    expect(article.hiddenAt).not.toBeNull();
  });

  it('rejects empty hide reasons and hiding non-published Articles', () => {
    expect(() => createArticle().hide('reason')).toThrowError(new DomainError('ARTICLE_INVALID_STATUS'));

    const article = createArticle({ publish: true, publishedAt });
    expect(() => article.hide('   ')).toThrowError(new DomainError('ARTICLE_INVALID_STATUS'));
  });

  it('deletes an Article terminally without changing its editorial status', () => {
    const article = createArticle({ publish: true, publishedAt });

    article.softDelete();
    const deletedAt = article.deletedAt;
    article.softDelete();

    expect(article.deletedAt).toBe(deletedAt);
    expect(article.status).toBe(ArticleStatus.Published);
    expect(() => article.update({ title: 'Changed' })).toThrowError(new DomainError('ARTICLE_IS_DELETED'));
    expect(() => article.publish()).toThrowError(new DomainError('ARTICLE_IS_DELETED'));
  });

  it('allows updating non-deleted metadata and content while preserving authorship and slug', () => {
    const article = createArticle({ tagSlugs: ['typescript'] });
    const originalSlug = article.slug;
    const originalAuthor = article.authorId;

    article.update({
      title: 'Updated',
      description: 'Updated description',
      content: 'Updated content',
      tagSlugs: ['typescript', 'backend', 'backend'],
    });

    expect(article.authorId).toBe(originalAuthor);
    expect(article.slug).toBe(originalSlug);
    expect(article.title).toBe('Updated');
    expect(article.description).toBe('Updated description');
    expect(article.content).toBe('Updated content');
    expect(article.tagSlugs).toEqual(['typescript', 'backend']);
  });

  it('rejects empty or oversized descriptions', () => {
    expect(() => createArticle({ description: '   ' })).toThrowError(new DomainError('ARTICLE_INVALID_DESCRIPTION'));
    expect(() => createArticle({ description: 'a'.repeat(321) })).toThrowError(
      new DomainError('ARTICLE_INVALID_DESCRIPTION'),
    );
  });

  it('applies content as a versioned domain operation and recalculates reading time', () => {
    const article = createArticle({ content: Array.from({ length: 401 }, () => 'word').join(' ') });
    const previousVersion = article.contentVersion;
    const previousReadingTime = article.readingTimeMinutes;

    article.applyContent('short replacement');

    expect(article.contentVersion).toBe(previousVersion + 1);
    expect(article.readingTimeMinutes).toBe(1);
    expect(article.readingTimeMinutes).not.toBe(previousReadingTime);
  });

  it('derives a minimum reading time and rounds up by two hundred words', () => {
    expect(Article.deriveReadingTimeMinutes('')).toBe(1);
    expect(Article.deriveReadingTimeMinutes('one two three')).toBe(1);
    expect(Article.deriveReadingTimeMinutes(Array.from({ length: 201 }, () => 'word').join(' '))).toBe(2);
  });

  it('deduplicates empty tag slugs without exposing its internal array', () => {
    const article = createArticle({ tagSlugs: ['typescript', '', 'typescript', 'backend'] });
    const tags = article.tagSlugs;
    tags.push('mutated');

    expect(article.tagSlugs).toEqual(['typescript', 'backend']);
  });

  it('rejects operations on a deleted Article while preserving the deletion marker', () => {
    const article = rehydrateArticle({ deletedAt: '2026-01-02T00:00:00.000Z' });

    expect(() => article.update({ title: 'Changed' })).toThrowError(new DomainError('ARTICLE_IS_DELETED'));
    expect(() => article.applyContent('Changed')).toThrowError(new DomainError('ARTICLE_IS_DELETED'));
    expect(() => article.archive()).toThrowError(new DomainError('ARTICLE_IS_DELETED'));
    expect(article.deletedAt).toBe('2026-01-02T00:00:00.000Z');
  });
});
