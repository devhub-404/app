import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import { JobAccessService } from '../../policies/job-access.service';
import { enrichJob } from '../../job-view';
import type { User } from '@/shared/kernel/auth/authenticated-user';
@Injectable()
export class CloseJobCommand {
  constructor(
    private readonly r: JobRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly access: JobAccessService,
  ) {}
  async execute(user: User, id: string) {
    const current = await this.r.getForAuthorization(id);
    if (!current) throw new AppError('CONTENT_NOT_FOUND');
    await this.access.assertCanManage(user, current);
    const job = await this.r.findAggregateById(id);
    if (!job) throw new AppError('CONTENT_NOT_FOUND');
    job.close();
    if (!(await this.r.saveAggregate(job))) throw new AppError('CONTENT_NOT_FOUND');
    const saved = await this.r.getForAuthorization(id);
    if (!saved) throw new AppError('CONTENT_NOT_FOUND');

    return enrichJob(this.t, saved);
  }
}
