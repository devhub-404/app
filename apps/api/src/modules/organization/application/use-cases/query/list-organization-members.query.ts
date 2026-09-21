import { Injectable } from '@nestjs/common';
import { OrganizationAccessPort } from '@/modules/organization/public/organization-access.port';
import { OrganizationQueryRepository } from '../../ports';
import { OrganizationMembershipDTO } from '../../dtos';

@Injectable()
export class ListOrganizationMembersQuery {
  constructor(
    private readonly repository: OrganizationQueryRepository,
    private readonly access: OrganizationAccessPort,
  ) {}

  async execute(accountId: string, organizationId: string): Promise<OrganizationMembershipDTO[]> {
    await this.access.assertCanManage(accountId, organizationId);

    return this.repository.listMembers(organizationId);
  }
}
