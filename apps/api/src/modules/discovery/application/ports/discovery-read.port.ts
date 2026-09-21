import type { DiscoveryPageDTO } from '@/modules/discovery/application/dtos/out';

export type DiscoveryListInput = {
  search?: string;
  types?: string;
  tags?: string;
  page?: number;
  pageSize?: number;
};

export abstract class DiscoveryReadPort {
  abstract list(
    input: DiscoveryListInput,
    mode?: 'relevance' | 'trending' | 'popular' | 'recent',
    tagMatch?: 'all' | 'any',
  ): Promise<DiscoveryPageDTO>;
  abstract feed(input: DiscoveryListInput, accountId?: string | null): Promise<DiscoveryPageDTO>;
  abstract related(id: string, requestedLimit?: number): Promise<DiscoveryPageDTO>;
}
