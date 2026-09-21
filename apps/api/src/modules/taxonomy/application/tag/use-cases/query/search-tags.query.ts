import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { TagDTO } from '@/modules/taxonomy/application/tag/dtos/out';
import { QueryTagDTO } from '@/modules/taxonomy/application/tag/dtos/in';
import { toTagSearchCriteria } from './tag-search-criteria';

@Injectable()
export class SearchTagsQuery {
  constructor(private readonly tagQueryRepository: TagQueryRepository) {}

  async execute(query: QueryTagDTO): Promise<TagDTO[]> {
    return await this.tagQueryRepository.search(toTagSearchCriteria(query));
  }
}
