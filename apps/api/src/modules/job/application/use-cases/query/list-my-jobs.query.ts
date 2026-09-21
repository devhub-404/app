import { Injectable } from '@nestjs/common';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { OrganizationAccessPort } from '@/modules/organization/public/organization-access.port';
import { JobQueryRepository } from '@/modules/job/application/ports/repositories/job.query.repository';
import { enrichJobPage } from '../../job-view';
import type { ListJobsDTO } from '../../dtos';
import { toJobSearchCriteria } from './job-search-criteria';
@Injectable()
export class ListMyJobsQuery {
  constructor(
    private readonly r: JobQueryRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly organizations: OrganizationAccessPort,
  ) {}
  async execute(accountId: string, q: ListJobsDTO) {
    const organizationIds = await this.organizations.listManageableOrganizationIds(accountId);
    const page = await this.r.searchManaged(toJobSearchCriteria(q), accountId, organizationIds);

    return enrichJobPage(this.t, page);
  }
}
