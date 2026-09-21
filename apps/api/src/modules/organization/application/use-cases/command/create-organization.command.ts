import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../ports';
import { CreateOrganizationDTO, OrganizationDTO } from '../../dtos';

@Injectable()
export class CreateOrganizationCommand {
  constructor(private readonly repository: OrganizationRepository) {}
  execute(accountId: string, input: CreateOrganizationDTO): Promise<OrganizationDTO> {
    return this.repository.createWithOwner(accountId, input);
  }
}
