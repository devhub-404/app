import { Injectable } from '@nestjs/common';
import { ExternalResourceSuggestionRepository } from '@/modules/external-resource/application/ports/repositories/external-resource-suggestion.repository';
import { toExternalResourceSuggestionDTO } from '@/modules/external-resource/application/dtos/out';
import { QueryResourceDTO } from '@/modules/external-resource/application/dtos/in';
import type { Paginated } from '@/shared/kernel/pagination';
import type { ExternalResourceSuggestionDTO } from '@/modules/external-resource/application/dtos/out';

@Injectable()
export class ListMyExternalResourceSuggestionsQuery {
  constructor(private readonly repository: ExternalResourceSuggestionRepository) {}

  execute(accountId: string, query: QueryResourceDTO): Promise<Paginated<ExternalResourceSuggestionDTO>> {
    return this.repository.listBySubmitter(accountId, query).then((result) => ({
      ...result,
      items: result.items.map(toExternalResourceSuggestionDTO),
    }));
  }
}
