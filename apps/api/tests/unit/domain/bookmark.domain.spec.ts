import { describe, expect, it } from 'vitest';
import { Bookmark, BookmarkTargetPolicy } from '@/modules/bookmark/domain';
import { DomainError } from '@/shared/errors/domain-error';
import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

const MATRIX: Array<[ResourceKind, boolean]> = [
  ['article', true],
  ['news', true],
  ['external_resource', true],
  ['project', true],
  ['event', false],
  ['job', false],
  ['question', true],
  ['answer', false],
];

describe('Bookmark domain', () => {
  const at = new Date('2026-01-01T00:00:00.000Z');

  it('creates personal state keyed only by accountId + resourceId', () => {
    const item = Bookmark.create('account-1', 'target-1', at);

    expect(item.value).toEqual({
      accountId: 'account-1',
      resourceId: 'target-1',
      active: true,
      createdAt: at.toISOString(),
      updatedAt: at.toISOString(),
    });
  });

  it('models save and remove as idempotent personal state transitions', () => {
    const item = Bookmark.create('account-1', 'target-1', at);
    const later = new Date('2026-01-02T00:00:00.000Z');

    item.remove(later);
    item.remove(later);
    expect(item.value.active).toBe(false);

    item.save(later);
    item.save(later);
    expect(item.value.active).toBe(true);
    expect(item.value.updatedAt).toBe(later.toISOString());
  });

  it('rejects incomplete Resource references', () => {
    expect(() => Bookmark.create('', 'target-1', at)).toThrowError(new DomainError('BOOKMARK_INVALID_REFERENCE'));
    expect(() => Bookmark.create('account-1', '', at)).toThrowError(new DomainError('BOOKMARK_INVALID_REFERENCE'));
  });

  it.each(MATRIX)('BKM-RN-003: capability for %s is %s', (kind, supported) => {
    expect(BookmarkTargetPolicy.supports(kind)).toBe(supported);
  });

  it('returns a copy of its state rather than exposing mutable internal state', () => {
    const item = Bookmark.create('account-1', 'target-1', at);
    const value = item.value;
    value.active = false;

    expect(item.value.active).toBe(true);
  });
});
