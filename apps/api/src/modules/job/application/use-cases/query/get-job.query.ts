import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { JobQueryRepository } from '@/modules/job/application/ports/repositories/job.query.repository';
import { OrganizationAccessPort } from '@/modules/organization/public/organization-access.port';
import { enrichJob } from '../../job-view';
@Injectable()
export class GetJobQuery {
  constructor(
    private readonly r: JobQueryRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly organizations: OrganizationAccessPort,
  ) {}
  async execute(id: string, a?: string) {
    let j = await this.r.findPublicById(id);
    if (!j && a) {
      const owned = await this.r.findForAuthorization(id);
      if (owned?.publisherOrganizationId) {
        try {
          await this.organizations.assertCanManage(a, owned.publisherOrganizationId);
          j = owned;
        } catch {
          /* remain unavailable */
        }
      }
    }
    if (!j) throw new AppError('CONTENT_NOT_FOUND');

    return enrichJob(this.t, j);
  }
}
