import { Injectable } from '@nestjs/common';
import { ExternalResourceQueryRepository } from '@/modules/external-resource/application/ports/repositories/resource.query.repository';
import { QueryResourceDTO } from '@/modules/external-resource/application/dtos/in';
import { Paginated } from '@/shared/kernel/pagination';
import { ResourceItemDTO } from '@/modules/external-resource/application/dtos/out';
import { toResourceSearchCriteria } from './resource-search-criteria';

@Injectable()
export class ListResourcesQuery {
  constructor(private readonly resourceQueryRepository: ExternalResourceQueryRepository) {}

  async execute(query: QueryResourceDTO): Promise<Paginated<ResourceItemDTO>> {
    return await this.resourceQueryRepository.search(toResourceSearchCriteria(query));
  }
}
