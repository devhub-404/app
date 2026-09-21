import { Injectable } from '@nestjs/common';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { JobQueryRepository } from '@/modules/job/application/ports/repositories/job.query.repository';
import { enrichJobPage } from '../../job-view';
import type { ListJobsDTO } from '../../dtos';
import { toJobSearchCriteria } from './job-search-criteria';
@Injectable()
export class ListJobsQuery {
  constructor(
    private readonly r: JobQueryRepository,
    private readonly t: TaxonomyPublicServicePort,
  ) {}
  execute(q: ListJobsDTO) {
    return this.r.search(toJobSearchCriteria(q)).then((p) => enrichJobPage(this.t, p));
  }
}
