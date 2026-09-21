import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { OrganizationAccessPort } from '@/modules/organization/public/organization-access.port';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { MAX_ACTIVE_JOBS } from '../../job-view';
import { Job } from '@/modules/job/domain/job';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import type { SaveJobDTO, JobDTO } from '../../dtos';
@Injectable()
export class CreateJobCommand {
  constructor(
    private readonly r: JobRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly accounts: AccountAccessPort,
    private readonly restrictions: ModerationAccountRestrictionPort,
    private readonly organizations: OrganizationAccessPort,
    private readonly identities: ResourceIdentityPort,
  ) {}
  async execute(a: string, i: SaveJobDTO): Promise<JobDTO> {
    await this.restrictions.assertAccountCapability(a, 'JOB_PUBLISH');
    if (!(await this.accounts.findPrimaryEmailByUserId(a))?.verifiedAt)
      throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
    await this.organizations.assertCanManage(a, i.publisherOrganizationId);
    const c = await this.t.validateTags(i.tagSlugs, a);
    const { tagSlugs: _, publisherOrganizationId, ...d } = i;

    return this.r.transaction(async (context) => {
      const identity = await this.identities.create('job', context);
      let aggregate: Job;
      try {
        aggregate = Job.create(identity.id, publisherOrganizationId, {
          ...d,
          location: d.location ?? null,
          compensationMin: d.compensationMin == null ? null : String(d.compensationMin),
          compensationMax: d.compensationMax == null ? null : String(d.compensationMax),
          compensationCurrency: d.compensationCurrency ?? null,
          compensationUnit: d.compensationUnit ?? null,
          sourceUrl: d.sourceUrl ?? null,
        });
      } catch {
        throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
      }
      const j = await this.r.createAggregateWithinActiveLimit(aggregate, MAX_ACTIVE_JOBS, context);
      if (!j) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
      await this.t.setResourceClassification(j.id, c, context);

      return { ...j, tagSlugs: i.tagSlugs };
    });
  }
}
