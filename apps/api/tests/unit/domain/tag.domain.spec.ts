import { describe, expect, it } from 'vitest';
import { Tag } from '@/modules/taxonomy/domain/tag';

describe('Tag domain', () => {
  it('TAX-RN-002/003 — creates a canonical identity with valid name/slug and deterministic normalization', () => {
    const tag = Tag.create('tag-1', { name: 'TypeScript', slug: 'typescript' });
    expect(tag.status).toBe('active');
    expect(Tag.normalizeSlug('  C++ & APIs  ')).toBe('c-apis');
    expect(Tag.defaultNameFromSlug('open-source-tools')).toBe('Open Source Tools');
    expect(() => Tag.create('tag-2', { name: 'Tag', slug: 'Invalid Slug' })).toThrow('TAG_INVALID_SLUG');
    expect(() => Tag.create('tag-3', { name: '', slug: 'valid' })).toThrow('TAG_INVALID_NAME');
  });

  it('TAX-RN-002/008 — limits identity lifecycle to ACTIVE ↔ ARCHIVED', () => {
    const tag = Tag.create('tag-1', { name: 'TypeScript', slug: 'typescript' });
    tag.archive();
    expect(tag.status).toBe('archived');
    expect(() => tag.archive()).toThrow('TAG_INVALID_STATUS');
    tag.unarchive();
    expect(tag.status).toBe('active');
    expect(() => tag.update({ status: 'deleted' as never })).toThrow('TAG_INVALID_STATUS');
  });

  it('TAX-RN-001/004/005 — preserves the stable canonical slug when metadata changes', () => {
    const tag = Tag.create('tag-1', { name: 'TypeScript', slug: 'typescript' });
    tag.update({ name: 'TypeScript Language' });
    expect(tag).toMatchObject({ name: 'TypeScript Language', slug: 'typescript', status: 'active' });
  });
});
