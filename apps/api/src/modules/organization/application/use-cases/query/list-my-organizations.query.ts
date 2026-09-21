import { Injectable } from '@nestjs/common';
import { OrganizationQueryRepository } from '../../ports';
import type { OrganizationWithMembership } from '../../ports';

@Injectable()
export class ListMyOrganizationsQuery {
  constructor(private readonly repository: OrganizationQueryRepository) {}
  execute(accountId: string): Promise<OrganizationWithMembership[]> {
    return this.repository.listByAccount(accountId);
  }
}
