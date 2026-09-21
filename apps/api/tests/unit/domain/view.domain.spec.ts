import { describe, expect, it } from 'vitest';
import { View, ViewTargetPolicy } from '@/modules/view/domain';
import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

const MATRIX: Array<[ResourceKind, boolean]> = [
  ['article', true],
  ['news', true],
  ['external_resource', false],
  ['project', false],
  ['event', false],
  ['job', false],
  ['question', false],
  ['answer', false],
];

describe('View domain', () => {
  it('records one authenticated Resource view reference with its creation instant', () => {
    const view = View.record({ accountId: 'account-1', resourceId: 'article-1' }, new Date('2026-01-01T00:00:00.000Z'));
    expect(view.value).toEqual({
      accountId: 'account-1',
      resourceId: 'article-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('rejects incomplete Resource references', () => {
    expect(() => View.record({ accountId: '', resourceId: 'article-1' })).toThrow('VIEW_INVALID_REFERENCE');
    expect(() => View.record({ accountId: 'account-1', resourceId: '' })).toThrow('VIEW_INVALID_REFERENCE');
  });

  it.each(MATRIX)('VIEW-RN-002: capability for %s is %s', (kind, supported) => {
    expect(ViewTargetPolicy.supports(kind)).toBe(supported);
  });
});
