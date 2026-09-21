import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { OrganizationQueryRepository } from '../application/ports';

export abstract class OrganizationAccessPort {
  abstract assertCanManage(accountId: string, organizationId: string): Promise<void>;
  abstract assertOwner(accountId: string, organizationId: string): Promise<void>;
  abstract canManage(accountId: string, organizationId: string): Promise<boolean>;
  abstract listManageableOrganizationIds(accountId: string): Promise<string[]>;
}

@Injectable()
export class OrganizationAccessService implements OrganizationAccessPort {
  constructor(private readonly repository: OrganizationQueryRepository) {}

  async assertCanManage(accountId: string, organizationId: string): Promise<void> {
    const organization = await this.repository.findById(organizationId);
    if (!organization || organization.status !== 'active') throw new AppError('CONTENT_NOT_FOUND');
    const role = await this.repository.getMembershipRole(organizationId, accountId);
    if (role !== 'owner' && role !== 'admin') throw new AppError('FORBIDDEN');
  }

  async assertOwner(accountId: string, organizationId: string): Promise<void> {
    const organization = await this.repository.findById(organizationId);
    if (!organization) throw new AppError('CONTENT_NOT_FOUND');
    const role = await this.repository.getMembershipRole(organizationId, accountId);
    if (role !== 'owner') throw new AppError('FORBIDDEN');
  }

  async canManage(accountId: string, organizationId: string): Promise<boolean> {
    try {
      await this.assertCanManage(accountId, organizationId);

      return true;
    } catch {
      return false;
    }
  }

  async listManageableOrganizationIds(accountId: string): Promise<string[]> {
    const organizations = await this.repository.listByAccount(accountId);

    return organizations
      .filter(
        (organization) =>
          organization.status === 'active' &&
          (organization.membershipRole === 'owner' || organization.membershipRole === 'admin'),
      )
      .map((organization) => organization.id);
  }
}
