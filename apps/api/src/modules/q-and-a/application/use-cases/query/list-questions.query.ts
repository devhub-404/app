import { Injectable } from '@nestjs/common';
import { QAndAQueryRepository } from '@/modules/q-and-a/application/ports/repositories';
import type { ListQuestionsDTO, PaginatedQuestionsDTO } from '../../dtos';
import type { QAndASearchCriteria } from '@/modules/q-and-a/application/ports/repositories/q-and-a-search.criteria';
@Injectable()
export class ListQuestionsQuery {
  constructor(private readonly repository: QAndAQueryRepository) {}
  async execute(input: ListQuestionsDTO): Promise<PaginatedQuestionsDTO> {
    const criteria: QAndASearchCriteria = { page: input.page, pageSize: input.pageSize };
    const search = input.search?.trim();
    if (search) criteria.search = search;
    if (input.status) criteria.status = input.status;
    const tags = input.tags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tags?.length) criteria.tags = tags;
    if (input.sort) criteria.sort = input.sort;
    const page = await this.repository.search(criteria);

    return page;
  }
}
