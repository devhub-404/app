import { Injectable } from '@nestjs/common';
import { ProjectQueryRepository } from '@/modules/project/application/ports/repositories/project.query.repository';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { enrichProjectPage } from '../../project-view';
import type { ListProjectsDTO } from '../../dtos';
import { toProjectSearchCriteria } from './project-search-criteria';
@Injectable()
export class ListProjectsForManagementQuery {
  constructor(
    private readonly r: ProjectQueryRepository,
    private readonly t: TaxonomyPublicServicePort,
  ) {}
  execute(q: ListProjectsDTO) {
    return this.r.searchForManagement(toProjectSearchCriteria(q)).then((p) => enrichProjectPage(this.t, p));
  }
}
