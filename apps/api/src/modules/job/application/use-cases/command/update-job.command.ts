import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import { JobAccessService } from '../../policies/job-access.service';
import type { UpdateJobDTO, JobDTO } from '../../dtos';
import type { User } from '@/shared/kernel/auth/authenticated-user';
@Injectable()
export class UpdateJobCommand {
  constructor(
    private readonly r: JobRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly access: JobAccessService,
  ) {}
  async execute(user: User, id: string, input: UpdateJobDTO): Promise<JobDTO> {
    const current = await this.r.getForAuthorization(id);
    if (!current) throw new AppError('CONTENT_NOT_FOUND');
    await this.access.assertCanManage(user, current);
    const classification = await this.t.validateTags(input.tagSlugs, user.sub);
    const { tagSlugs: _, ...data } = input;
    const aggregate = await this.r.findAggregateById(id);
    if (!aggregate) throw new AppError('CONTENT_NOT_FOUND');
    aggregate.updateDetails({
      ...data,
      location: data.location ?? null,
      compensationMin: data.compensationMin == null ? null : String(data.compensationMin),
      compensationMax: data.compensationMax == null ? null : String(data.compensationMax),
      compensationCurrency: data.compensationCurrency ?? null,
      compensationUnit: data.compensationUnit ?? null,
      sourceUrl: data.sourceUrl ?? null,
    });

    return this.r.transaction(async (context) => {
      if (!(await this.r.saveAggregate(aggregate, context))) throw new AppError('CONTENT_NOT_FOUND');
      await this.t.setResourceClassification(id, classification, context);

      return { ...current, ...aggregate.snapshot(), tagSlugs: input.tagSlugs };
    });
  }
}
