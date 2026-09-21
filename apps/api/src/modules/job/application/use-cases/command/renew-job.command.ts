import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import { JobAccessService } from '../../policies/job-access.service';
import { enrichJob, MAX_ACTIVE_JOBS } from '../../job-view';
import type { User } from '@/shared/kernel/auth/authenticated-user';
@Injectable()
export class RenewJobCommand {
  constructor(
    private readonly r: JobRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly restrictions: ModerationAccountRestrictionPort,
    private readonly access: JobAccessService,
  ) {}
  async execute(user: User, id: string) {
    const current = await this.r.getForAuthorization(id);
    if (!current) throw new AppError('CONTENT_NOT_FOUND');
    await this.access.assertCanManage(user, current);
    if (current.publisherOrganizationId) {
      await this.restrictions.assertAccountCapability(user.sub, 'JOB_PUBLISH');
    }
    const job = await this.r.findAggregateById(id);
    if (!job) throw new AppError('CONTENT_NOT_FOUND');
    const result = await this.r.renewAggregateWithinActiveLimit(job, MAX_ACTIVE_JOBS);
    if (result.limitExceeded) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
    if (!result.saved) throw new AppError('CONTENT_NOT_FOUND');

    const renewed = await this.r.getForAuthorization(id);
    if (!renewed) throw new AppError('CONTENT_NOT_FOUND');

    return enrichJob(this.t, renewed);
  }
}
