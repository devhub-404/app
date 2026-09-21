import { describe, expect, it } from 'vitest';
import { Organization } from '@/modules/organization/domain/organization';

const organization = (status: 'active' | 'archived' = 'active') =>
  Organization.rehydrate({
    id: 'org-1',
    name: 'DevHub',
    slug: 'devhub',
    type: 'community',
    description: 'Developer community',
    websiteUrl: null,
    avatarUrl: null,
    createdByAccountId: 'owner-1',
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    memberships: [{ accountId: 'owner-1', role: 'owner' }],
  });

describe('Organization domain', () => {
  it('ORG-RN-003/ORG-RN-004 — manages membership uniqueness and preserves at least one OWNER', () => {
    const value = organization();
    value.addMember('member-1', 'member');
    expect(() => value.addMember('member-1', 'admin')).toThrow('ORGANIZATION_MEMBER_ALREADY_EXISTS');
    value.changeMemberRole('member-1', 'admin');
    expect(value.snapshot().memberships).toContainEqual({ accountId: 'member-1', role: 'admin' });
    expect(() => value.changeMemberRole('owner-1', 'member')).toThrow('ORGANIZATION_LAST_OWNER');
    expect(() => value.removeMember('owner-1')).toThrow('ORGANIZATION_LAST_OWNER');
    value.removeMember('member-1');
    expect(() => value.removeMember('member-1')).toThrow('ORGANIZATION_MEMBER_NOT_FOUND');
  });

  it('ORG-RN-005/ORG-RN-009 — archived organizations reject operational changes and can be reactivated', () => {
    const value = organization();
    value.archive();
    expect(value.snapshot().status).toBe('archived');
    expect(() => value.addMember('member-1', 'member')).toThrow('ORGANIZATION_ARCHIVED');
    expect(() => value.update({ name: 'Changed' })).toThrow('ORGANIZATION_ARCHIVED');
    value.unarchive();
    expect(value.snapshot().status).toBe('active');
  });

  it('ORG-RN-002/ORG-RF-004 — validates mutable public identity fields without changing the stable slug', () => {
    const value = organization();
    value.update({ name: '  New DevHub  ', description: 'A new description' });
    expect(value.snapshot()).toMatchObject({ name: 'New DevHub', slug: 'devhub', description: 'A new description' });
    expect(() => value.update({ name: ' ' })).toThrow('ORGANIZATION_INVALID_NAME');
    expect(() => value.update({ description: '' })).toThrow('ORGANIZATION_INVALID_DESCRIPTION');
  });

  it('ORG-RN-003 — rejects membership operations for absent members', () => {
    const value = organization();
    expect(() => value.changeMemberRole('missing', 'admin')).toThrow('ORGANIZATION_MEMBER_NOT_FOUND');
    expect(() => value.removeMember('missing')).toThrow('ORGANIZATION_MEMBER_NOT_FOUND');
  });

  it('ORG-RN-010 — keeps the tombstone terminal', () => {
    const value = organization();
    value.delete();
    expect(() => value.archive()).toThrow('ORGANIZATION_DELETED');
    expect(() => value.unarchive()).toThrow('ORGANIZATION_DELETED');
  });
});
