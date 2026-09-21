import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { OrganizationAccessPort } from '@/modules/organization/public/organization-access.port';
import { OrganizationRepository } from '../../ports';
import { ChangeOrganizationMemberRoleDTO, OrganizationMembershipDTO } from '../../dtos';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class ChangeOrganizationMemberRoleCommand {
  constructor(
    private readonly repository: OrganizationRepository,
    private readonly access: OrganizationAccessPort,
  ) {}
  async execute(
    actorId: string,
    organizationId: string,
    accountId: string,
    input: ChangeOrganizationMemberRoleDTO,
  ): Promise<OrganizationMembershipDTO> {
    await this.access.assertOwner(actorId, organizationId);
    const organization = await this.repository.findAggregateById(organizationId);
    if (!organization) throw new AppError('CONTENT_NOT_FOUND');
    try {
      organization.changeMemberRole(accountId, input.role);
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw error;
    }
    const membership = await this.repository.changeMemberRole(organizationId, accountId, input.role);
    if (!membership) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

    return membership;
  }
}
