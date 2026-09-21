import { describe, expect, it } from 'vitest';
import { News, NewsStatus } from '@/modules/news/domain/news';
import { NewsSuggestion, NewsSuggestionStatus } from '@/modules/news/domain/news-suggestion';

const createNews = () =>
  News.create('news-1', {
    title: 'A relevant ecosystem update',
    description: 'A concise description of the relevant ecosystem update.',
    slug: 'relevant-ecosystem-update',
    content: 'What happened, why it matters and what changes next.',
    occurredAt: '2026-01-01T00:00:00.000Z',
    tagSlugs: ['typescript', 'typescript', ''],
  });

describe('News domain', () => {
  it('NEWS-RN-001/004 — creates a draft with occurrence, content version and unique tags', () => {
    const news = createNews();
    expect(news.status).toBe(NewsStatus.Draft);
    expect(news.publishedAt).toBeNull();
    expect(news.occurredAt).toBe('2026-01-01T00:00:00.000Z');
    expect(news.contentVersion).toBe(1);
    expect(news.tagSlugs).toEqual(['typescript']);
  });

  it('NEWS-RN-001/004/008 — requires valid editorial fields and occurredAt before publication', () => {
    expect(() =>
      News.create('news-1', { title: '', description: 'Description', slug: 'valid-slug', content: 'Content' }),
    ).toThrow('NEWS_INVALID_TITLE');
    expect(() =>
      News.create('news-1', { title: 'Title', description: 'Description', slug: 'Invalid Slug', content: 'Content' }),
    ).toThrow('NEWS_INVALID_SLUG');
    const news = News.create('news-1', {
      title: 'Title',
      description: 'Description',
      slug: 'valid-slug',
      content: 'Content',
    });
    expect(() => news.publish('2026-01-02T00:00:00.000Z')).toThrow('NEWS_OCCURRED_AT_REQUIRED');
    news.update({ occurredAt: '2026-01-01T00:00:00.000Z' });
    news.publish('2026-01-02T00:00:00.000Z');
    expect(news.status).toBe(NewsStatus.Published);
    expect(news.publishedAt).toBe('2026-01-02T00:00:00.000Z');
  });

  it('NEWS-RN-002 — preserves slug and status on update, and versions complete content replacement', () => {
    const news = createNews();
    news.update({ title: 'Updated title', content: 'Updated editorial content.' });
    expect(news.slug).toBe('relevant-ecosystem-update');
    expect(news.status).toBe(NewsStatus.Draft);
    expect(news.content).toBe('Updated editorial content.');
    news.applyContent('A second complete version.');
    expect(news.contentVersion).toBe(2);
    expect(news.content).toBe('A second complete version.');
  });

  it('NEWS-RN-002/003 — archives and unarchives, while delete is terminal', () => {
    const news = createNews();
    news.publish('2026-01-02T00:00:00.000Z');
    news.archive();
    expect(news.status).toBe(NewsStatus.Archived);
    news.unarchive();
    expect(news.status).toBe(NewsStatus.Published);
    news.softDelete();
    expect(news.deletedAt).not.toBeNull();
    expect(news.status).toBe(NewsStatus.Archived);
    expect(() => news.update({ title: 'No longer editable' })).toThrow('NEWS_IS_DELETED');
    expect(() => news.unarchive()).toThrow('NEWS_IS_DELETED');
  });
});

describe('NewsSuggestion domain', () => {
  it('stores the canonical URL directly in url and allows one terminal decision', () => {
    const suggestion = NewsSuggestion.create('suggestion-1', 'https://example.com/story/#tracking', 'account-1');
    expect(suggestion.url).toBe('https://example.com/story');
    suggestion.accept('news-1', 'curator-1');
    expect(suggestion.status).toBe(NewsSuggestionStatus.Accepted);
    expect(suggestion.acceptedNewsId).toBe('news-1');
    expect(suggestion.decidedAt).not.toBeNull();
    expect(() => suggestion.reject('curator-1')).toThrow('NEWS_SUGGESTION_INVALID_STATUS');
  });

  it('rejects unsupported suggestion URLs', () => {
    expect(() => NewsSuggestion.create('suggestion-1', 'ftp://example.com/story', 'account-1')).toThrow(
      'NEWS_SUGGESTION_INVALID_URL',
    );
  });
});
