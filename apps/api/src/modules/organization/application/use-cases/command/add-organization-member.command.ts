import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountEligibilityPort } from '@/modules/account/public/account-eligibility.port';
import { OrganizationAccessPort } from '@/modules/organization/public/organization-access.port';
import { OrganizationRepository } from '../../ports';
import { AddOrganizationMemberDTO, OrganizationMembershipDTO } from '../../dtos';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class AddOrganizationMemberCommand {
  constructor(
    private readonly repository: OrganizationRepository,
    private readonly access: OrganizationAccessPort,
    private readonly accounts: AccountEligibilityPort,
  ) {}
  async execute(
    actorId: string,
    organizationId: string,
    input: AddOrganizationMemberDTO,
  ): Promise<OrganizationMembershipDTO> {
    await this.access.assertOwner(actorId, organizationId);
    if (!(await this.accounts.getAccessEligibility(input.accountId))) throw new AppError('USER_NOT_FOUND');
    const organization = await this.repository.findAggregateById(organizationId);
    if (!organization) throw new AppError('CONTENT_NOT_FOUND');
    try {
      organization.addMember(input.accountId, input.role);
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw error;
    }
    const membership = await this.repository.addMember(organizationId, input.accountId, input.role);
    if (!membership) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

    return membership;
  }
}
