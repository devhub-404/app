import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { OrganizationRepository } from '../../ports';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class LeaveOrganizationCommand {
  constructor(private readonly repository: OrganizationRepository) {}
  async execute(accountId: string, organizationId: string): Promise<void> {
    const organization = await this.repository.findAggregateById(organizationId);
    if (!organization) throw new AppError('CONTENT_NOT_FOUND');
    try {
      organization.removeMember(accountId);
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw error;
    }
    if (!(await this.repository.removeMember(organizationId, accountId)))
      throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
  }
}
