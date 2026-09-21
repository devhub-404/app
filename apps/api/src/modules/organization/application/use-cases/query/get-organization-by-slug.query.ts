import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { OrganizationQueryRepository } from '../../ports';
import { OrganizationDTO } from '../../dtos';

@Injectable()
export class GetOrganizationBySlugQuery {
  constructor(private readonly repository: OrganizationQueryRepository) {}
  async execute(slug: string): Promise<OrganizationDTO> {
    const organization = await this.repository.findPublicBySlug(slug);
    if (!organization) throw new AppError('CONTENT_NOT_FOUND');

    return organization;
  }
}
