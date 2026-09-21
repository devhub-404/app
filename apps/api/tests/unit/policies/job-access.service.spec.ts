import { describe, expect, it, vi } from 'vitest';
import { JobAccessService } from '@/modules/job/application/policies/job-access.service';
import { Role } from '@/shared/kernel/auth/role';

const communityJob = { publisherOrganizationId: null } as never;
const organizationJob = { publisherOrganizationId: 'org-1' } as never;

describe('JobAccessService', () => {
  it('allows curators and admins to manage community jobs', async () => {
    const service = new JobAccessService({ assertCanManage: vi.fn() } as never);

    await expect(service.assertCanManage({ sub: 'account-1', role: Role.CURATOR }, communityJob)).resolves.toBeUndefined();
    await expect(service.assertCanManage({ sub: 'account-1', role: Role.ADMIN }, communityJob)).resolves.toBeUndefined();
  });

  it('rejects ordinary users from managing community jobs', async () => {
    const service = new JobAccessService({ assertCanManage: vi.fn() } as never);

    await expect(service.assertCanManage({ sub: 'account-1', role: null }, communityJob)).rejects.toMatchObject({
      code: 'CONTENT_INTERACTION_NOT_ALLOWED',
    });
  });

  it('delegates organization jobs to organization access', async () => {
    const assertCanManage = vi.fn(async () => undefined);
    const service = new JobAccessService({ assertCanManage } as never);

    await expect(service.assertCanManage({ sub: 'account-1', role: null }, organizationJob)).resolves.toBeUndefined();
    expect(assertCanManage).toHaveBeenCalledWith('account-1', 'org-1');
  });

  it('converts access failures to false', async () => {
    const service = new JobAccessService({
      assertCanManage: vi.fn(async () => {
        throw new Error('forbidden');
      }),
    } as never);

    await expect(service.canManage({ sub: 'account-1', role: null }, organizationJob)).resolves.toBe(false);
  });
});
