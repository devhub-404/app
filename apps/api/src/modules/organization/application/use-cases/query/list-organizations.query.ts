import { Injectable } from '@nestjs/common';
import { OrganizationQueryRepository } from '../../ports';
import { ListOrganizationsDTO, PaginatedOrganizationsDTO } from '../../dtos';

@Injectable()
export class ListOrganizationsQuery {
  constructor(private readonly repository: OrganizationQueryRepository) {}
  execute(input: ListOrganizationsDTO): Promise<PaginatedOrganizationsDTO> {
    return this.repository.listPublic(input);
  }
}
