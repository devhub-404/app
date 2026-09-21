import { Injectable } from '@nestjs/common';
import { QueryResourceDTO } from '@/modules/external-resource/application/dtos/in';
import { ResourceItemDTO } from '@/modules/external-resource/application/dtos/out';
import { ExternalResourceQueryRepository } from '@/modules/external-resource/application/ports/repositories/resource.query.repository';
import { Paginated } from '@/shared/kernel/pagination';
import { toResourceSearchCriteria } from './resource-search-criteria';

@Injectable()
export class ListResourcesForManagementQuery {
  constructor(private readonly resourceQueryRepository: ExternalResourceQueryRepository) {}

  execute(query: QueryResourceDTO): Promise<Paginated<ResourceItemDTO>> {
    return this.resourceQueryRepository.searchForManagement(toResourceSearchCriteria(query));
  }
}
