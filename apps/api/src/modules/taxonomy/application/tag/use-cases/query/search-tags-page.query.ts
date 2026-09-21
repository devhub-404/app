import { Injectable } from '@nestjs/common';
import { QueryTagDTO } from '@/modules/taxonomy/application/tag/dtos/in';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { TagDTO } from '@/modules/taxonomy/application/tag/dtos/out';
import { Paginated } from '@/shared/kernel/pagination';
import { toTagSearchCriteria } from './tag-search-criteria';

@Injectable()
export class SearchTagsPageQuery {
  constructor(private readonly tags: TagQueryRepository) {}

  execute(query: QueryTagDTO): Promise<Paginated<TagDTO>> {
    return this.tags.searchPage(toTagSearchCriteria(query));
  }
}
