import { describe, expect, it, vi } from 'vitest';
import { CreateOrganizationCommand } from '@/modules/organization/application/use-cases/command/create-organization.command';
import { RemoveOrganizationMemberCommand } from '@/modules/organization/application/use-cases/command/remove-organization-member.command';
import { UpdateOrganizationCommand } from '@/modules/organization/application/use-cases/command/update-organization.command';
import { ArchiveOrganizationCommand } from '@/modules/organization/application/use-cases/command/archive-organization.command';
import { UnarchiveOrganizationCommand } from '@/modules/organization/application/use-cases/command/unarchive-organization.command';
import { AddOrganizationMemberCommand } from '@/modules/organization/application/use-cases/command/add-organization-member.command';
import { ChangeOrganizationMemberRoleCommand } from '@/modules/organization/application/use-cases/command/change-organization-member-role.command';
import { LeaveOrganizationCommand } from '@/modules/organization/application/use-cases/command/leave-organization.command';
import { DeleteOrganizationCommand } from '@/modules/organization/application/use-cases/command/delete-organization.command';
import { ListOrganizationsQuery } from '@/modules/organization/application/use-cases/query/list-organizations.query';
import { GetOrganizationBySlugQuery } from '@/modules/organization/application/use-cases/query/get-organization-by-slug.query';
import { ListMyOrganizationsQuery } from '@/modules/organization/application/use-cases/query/list-my-organizations.query';
import { ListOrganizationMembersQuery } from '@/modules/organization/application/use-cases/query/list-organization-members.query';
import { Organization } from '@/modules/organization/domain/organization';

// Normative source: docs/domains/organization/SPEC.md.
describe('Organization use cases', () => {
  it('ORG-RF-001/ORG-RNF-001 — creation delegates Organization + first OWNER to one atomic repository operation', async () => {
    const createWithOwner = vi.fn(async (accountId: string, input: unknown) => ({
      id: 'org-1',
      name: 'Org',
      ...input,
      createdByAccountId: accountId,
    }));
    const command = new CreateOrganizationCommand({ createWithOwner } as never);
    const input = { name: 'Org', type: 'community', description: 'Community', websiteUrl: null } as never;

    await command.execute('account-1', input);

    expect(createWithOwner).toHaveBeenCalledTimes(1);
    expect(createWithOwner).toHaveBeenCalledWith('account-1', input);
  });

  it('ORG-BE-UC-002/003/004 — update and ACTIVE↔ARCHIVED lifecycle re-evaluate current Organization authority at each write', async () => {
    const assertCanManage = vi.fn(async () => undefined);
    const assertOwner = vi.fn(async () => undefined);
    let current = {
      id: 'org-1',
      slug: 'devhub',
      status: 'active',
      name: 'Organization',
      type: 'community',
      description: 'Description',
      websiteUrl: null,
      avatarUrl: null,
      createdByAccountId: 'owner-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      memberships: [],
    };
    const findAggregateById = vi.fn(async () => Organization.rehydrate(current as never));
    const saveAggregate = vi.fn(async (value: Organization) => {
      current = { ...current, ...value.snapshot() };

      return true;
    });
    const getById = vi.fn(async () => current);
    const repo = { findAggregateById, saveAggregate, getById } as never;
    const access = { assertCanManage, assertOwner } as never;

    await expect(
      new UpdateOrganizationCommand(repo, access).execute('actor-1', 'org-1', { name: 'Updated' } as never),
    ).resolves.toMatchObject({ slug: 'devhub', name: 'Updated' });
    await expect(new ArchiveOrganizationCommand(repo, access).execute('owner-1', 'org-1')).resolves.toMatchObject({
      status: 'archived',
    });
    await expect(new UnarchiveOrganizationCommand(repo, access).execute('owner-1', 'org-1')).resolves.toMatchObject({
      status: 'active',
    });
    expect(assertCanManage).toHaveBeenCalledWith('actor-1', 'org-1');
    expect(assertOwner).toHaveBeenCalledTimes(2);
    expect(saveAggregate).toHaveBeenCalledTimes(3);
  });

  it('ORG-BE-UC-005/006 — OWNER can add an eligible Account and change membership role, while repository enforces uniqueness/last-owner invariants', async () => {
    const assertOwner = vi.fn(async () => undefined);
    const getAccessEligibility = vi.fn(async () => ({ accountId: 'member-1', eligible: true }));
    const addMember = vi.fn(async () => ({ organizationId: 'org-1', accountId: 'member-1', role: 'member' }));
    const changeMemberRole = vi.fn(async () => ({ organizationId: 'org-1', accountId: 'member-1', role: 'admin' }));
    const aggregate = (memberships: Array<{ accountId: string; role: 'owner' | 'admin' | 'member' }>) =>
      Organization.rehydrate({
        id: 'org-1',
        name: 'Org',
        slug: 'org',
        type: 'community',
        description: 'Description',
        websiteUrl: null,
        avatarUrl: null,
        createdByAccountId: 'owner-1',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        memberships,
      } as never);
    const findAggregateById = vi
      .fn()
      .mockResolvedValueOnce(aggregate([{ accountId: 'owner-1', role: 'owner' }]))
      .mockResolvedValueOnce(
        aggregate([
          { accountId: 'owner-1', role: 'owner' },
          { accountId: 'member-1', role: 'member' },
        ]),
      );
    const repo = { addMember, changeMemberRole, findAggregateById } as never;
    const access = { assertOwner } as never;
    const accounts = { getAccessEligibility } as never;

    await expect(
      new AddOrganizationMemberCommand(repo, access, accounts).execute('owner-1', 'org-1', {
        accountId: 'member-1',
        role: 'member',
      } as never),
    ).resolves.toMatchObject({ role: 'member' });
    await expect(
      new ChangeOrganizationMemberRoleCommand(repo, access).execute('owner-1', 'org-1', 'member-1', {
        role: 'admin',
      } as never),
    ).resolves.toMatchObject({ role: 'admin' });
    expect(assertOwner).toHaveBeenCalledTimes(2);
    expect(getAccessEligibility).toHaveBeenCalledWith('member-1');
    expect(addMember).toHaveBeenCalledWith('org-1', 'member-1', 'member');
    expect(changeMemberRole).toHaveBeenCalledWith('org-1', 'member-1', 'admin');
  });

  it('ORG-BE-UC-008 — voluntary leave is the same membership removal invariant and cannot silently bypass last-owner refusal', async () => {
    const removeMember = vi.fn(async () => true);
    const organization = Organization.rehydrate({
      id: 'org-1',
      name: 'Org',
      slug: 'org',
      type: 'community',
      description: 'Description',
      websiteUrl: null,
      avatarUrl: null,
      createdByAccountId: 'owner-1',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      memberships: [{ accountId: 'member-1', role: 'member' }],
    } as never);
    const findAggregateById = vi.fn(async () => organization);
    await new LeaveOrganizationCommand({ removeMember, findAggregateById } as never).execute('member-1', 'org-1');
    expect(removeMember).toHaveBeenCalledWith('org-1', 'member-1');
    removeMember.mockResolvedValue(false);
    await expect(
      new LeaveOrganizationCommand({
        removeMember,
        findAggregateById: vi.fn(async () =>
          Organization.rehydrate({
            ...organization.snapshot(),
            memberships: [{ accountId: 'owner-1', role: 'owner' }],
          }),
        ),
      } as never).execute('owner-1', 'org-1'),
    ).rejects.toMatchObject({ code: 'CONTENT_INTERACTION_NOT_ALLOWED' });
  });

  it('ORG-BE-UC-009/010/011/012 — public, own and administrative member read surfaces preserve lifecycle and Account scope', async () => {
    const active = { id: 'org-1', slug: 'devhub', status: 'active' };
    const page = { items: [active], total: 1, page: 1, pageSize: 20 };
    const listPublic = vi.fn(async () => page);
    const findPublicBySlug = vi.fn(async () => active);
    const listByAccount = vi.fn(async () => [{ organization: active, role: 'owner' }]);
    const findById = vi.fn(async () => active);
    const listMembers = vi.fn(async () => [{ organizationId: 'org-1', accountId: 'owner-1', role: 'owner' }]);
    const assertCanManage = vi.fn(async () => undefined);
    const repo = { listPublic, findPublicBySlug, listByAccount, findById, listMembers } as never;
    const access = { assertCanManage } as never;
    const filter = { page: 1, pageSize: 20 } as never;

    await expect(new ListOrganizationsQuery(repo).execute(filter)).resolves.toBe(page);
    await expect(new GetOrganizationBySlugQuery(repo).execute('devhub')).resolves.toBe(active);
    await expect(new ListMyOrganizationsQuery(repo).execute('owner-1')).resolves.toHaveLength(1);
    await expect(new ListOrganizationMembersQuery(repo, access).execute('owner-1', 'org-1')).resolves.toHaveLength(1);
    expect(listPublic).toHaveBeenCalledWith(filter);
    expect(findPublicBySlug).toHaveBeenCalledWith('devhub');
    expect(listByAccount).toHaveBeenCalledWith('owner-1');
    expect(assertCanManage).toHaveBeenCalledWith('owner-1', 'org-1');
    expect(listMembers).toHaveBeenCalledWith('org-1');
  });

  it('ORG-RN-004/ORG-RF-008 — a repository refusal to remove the last OWNER is surfaced and not converted into success', async () => {
    const assertOwner = vi.fn(async () => undefined);
    const removeMember = vi.fn(async () => false);
    const findAggregateById = vi.fn(async () =>
      Organization.rehydrate({
        id: 'org-1',
        name: 'Org',
        slug: 'org',
        type: 'community',
        description: 'Description',
        websiteUrl: null,
        avatarUrl: null,
        createdByAccountId: 'owner-1',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        memberships: [{ accountId: 'owner-1', role: 'owner' }],
      } as never),
    );
    const command = new RemoveOrganizationMemberCommand(
      { removeMember, findAggregateById } as never,
      { assertOwner } as never,
    );

    await expect(command.execute('owner-1', 'org-1', 'owner-1')).rejects.toMatchObject({
      code: 'CONTENT_INTERACTION_NOT_ALLOWED',
    });
    expect(assertOwner).toHaveBeenCalledBefore(findAggregateById);
  });

  it('ORG-RN-009/ORG-RF-002/ORG-RF-006 — archived organizations are not resolvable through public detail', async () => {
    const archived = { id: 'org-1', slug: 'devhub', status: 'archived' };
    const findPublicBySlug = vi.fn(async () => null);
    const findById = vi.fn(async () => archived);
    const listMembers = vi.fn(async () => []);
    const repository = { findPublicBySlug, findById, listMembers } as never;
    const assertCanManage = vi.fn(async () => undefined);
    const access = { assertCanManage } as never;

    await expect(new GetOrganizationBySlugQuery(repository).execute('devhub')).rejects.toMatchObject({
      code: 'CONTENT_NOT_FOUND',
    });
    await expect(new ListOrganizationMembersQuery(repository, access).execute('owner-1', 'org-1')).resolves.toEqual([]);
  });

  it('ORG-RN-010/ORG-RF-005 — delete is OWNER-only, terminal, persists a tombstone and rejects repeated deletion', async () => {
    const assertOwner = vi.fn(async () => undefined);
    const aggregate = Organization.rehydrate({
      id: 'org-1',
      name: 'Org',
      slug: 'org',
      type: 'community',
      description: 'Description',
      websiteUrl: null,
      avatarUrl: null,
      createdByAccountId: 'owner-1',
      status: 'active',
      deletedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      memberships: [{ accountId: 'owner-1', role: 'owner' }],
    } as never);
    const findAggregateById = vi.fn(async () => aggregate);
    const saveAggregate = vi.fn(async () => true);
    const command = new DeleteOrganizationCommand(
      { findAggregateById, saveAggregate } as never,
      { assertOwner } as never,
    );

    await command.execute('owner-1', 'org-1');
    expect(assertOwner).toHaveBeenCalledWith('owner-1', 'org-1');
    expect(aggregate.snapshot().deletedAt).toBeTruthy();
    expect(saveAggregate).toHaveBeenCalledWith(aggregate);

    await expect(command.execute('owner-1', 'org-1')).rejects.toMatchObject({
      code: 'CONTENT_INTERACTION_NOT_ALLOWED',
    });
  });
});
