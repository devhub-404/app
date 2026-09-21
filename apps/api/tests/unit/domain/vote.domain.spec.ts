import { describe, expect, it } from 'vitest';
import { Vote, VoteTargetPolicy } from '@/modules/vote/domain';
import { DomainError } from '@/shared/errors/domain-error';
import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

const MATRIX: Array<[ResourceKind, boolean]> = [
  ['article', true],
  ['news', false],
  ['external_resource', true],
  ['project', true],
  ['event', false],
  ['job', false],
  ['question', true],
  ['answer', true],
];

describe('Vote domain', () => {
  const at = new Date('2026-01-01T00:00:00.000Z');

  it('models a positive vote as idempotent active state over ResourceIdentity', () => {
    const vote = Vote.create('account-1', 'target-1', at);
    vote.remove(at);
    vote.set(at);
    vote.set(at);

    expect(vote.value).toMatchObject({ accountId: 'account-1', resourceId: 'target-1', active: true });
  });

  it('rejects incomplete Resource references', () => {
    expect(() => Vote.create('', 'target-1', at)).toThrowError(new DomainError('VOTE_INVALID_REFERENCE'));
    expect(() => Vote.create('account-1', '', at)).toThrowError(new DomainError('VOTE_INVALID_REFERENCE'));
  });

  it.each(MATRIX)('VOTE-RN-003: capability for %s is %s', (kind, supported) => {
    expect(VoteTargetPolicy.supports(kind)).toBe(supported);
  });
});
