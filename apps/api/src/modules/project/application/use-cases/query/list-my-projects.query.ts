import { Injectable } from '@nestjs/common';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { ProjectQueryRepository } from '@/modules/project/application/ports/repositories/project.query.repository';
import { enrichProjectPage } from '../../project-view';
import type { ListProjectsDTO } from '../../dtos';
import { toProjectSearchCriteria } from './project-search-criteria';

@Injectable()
export class ListMyProjectsQuery {
  constructor(
    private readonly r: ProjectQueryRepository,
    private readonly t: TaxonomyPublicServicePort,
  ) {}

  async execute(accountId: string, q: ListProjectsDTO) {
    return enrichProjectPage(this.t, await this.r.searchManaged(toProjectSearchCriteria(q), accountId));
  }
}
