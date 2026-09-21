import { Injectable } from '@nestjs/common';
import { JobQueryRepository } from '@/modules/job/application/ports/repositories/job.query.repository';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { enrichJobPage } from '../../job-view';
import type { ListJobsDTO } from '../../dtos';
import { toJobSearchCriteria } from './job-search-criteria';
@Injectable()
export class ListJobsForManagementQuery {
  constructor(
    private readonly r: JobQueryRepository,
    private readonly t: TaxonomyPublicServicePort,
  ) {}
  execute(q: ListJobsDTO) {
    return this.r.searchForManagement(toJobSearchCriteria(q)).then((p) => enrichJobPage(this.t, p));
  }
}
