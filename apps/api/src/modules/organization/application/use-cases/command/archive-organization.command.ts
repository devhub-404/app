import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { OrganizationAccessPort } from '@/modules/organization/public/organization-access.port';
import { OrganizationRepository } from '../../ports';
import { OrganizationDTO } from '../../dtos';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class ArchiveOrganizationCommand {
  constructor(
    private readonly repository: OrganizationRepository,
    private readonly access: OrganizationAccessPort,
  ) {}
  async execute(accountId: string, id: string): Promise<OrganizationDTO> {
    await this.access.assertOwner(accountId, id);
    const organization = await this.repository.findAggregateById(id);
    if (!organization) throw new AppError('CONTENT_NOT_FOUND');
    try {
      organization.archive();
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw error;
    }
    if (!(await this.repository.saveAggregate(organization))) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
    const saved = await this.repository.getById(id);
    if (!saved) throw new AppError('CONTENT_NOT_FOUND');

    return saved;
  }
}
