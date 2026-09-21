import { Paginated } from '@/shared/kernel/pagination';
import { ResourceItemDTO } from '@/modules/external-resource/application/dtos/out';
import type { ResourceSearchCriteria } from './resource-search.criteria';

export abstract class ExternalResourceQueryRepository {
  abstract findById(id: string): Promise<ResourceItemDTO | null>;
  abstract findByIdForManagement(id: string): Promise<ResourceItemDTO | null>;
  abstract search(query: ResourceSearchCriteria): Promise<Paginated<ResourceItemDTO>>;
  abstract searchForManagement(query: ResourceSearchCriteria): Promise<Paginated<ResourceItemDTO>>;
}
