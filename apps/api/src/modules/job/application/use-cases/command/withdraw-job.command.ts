import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import { JobAccessService } from '../../policies/job-access.service';
import type { User } from '@/shared/kernel/auth/authenticated-user';
@Injectable()
export class WithdrawJobCommand {
  constructor(
    private readonly repository: JobRepository,
    private readonly access: JobAccessService,
  ) {}
  async execute(user: User, id: string) {
    const current = await this.repository.getForAuthorization(id);
    if (!current) throw new AppError('CONTENT_NOT_FOUND');
    await this.access.assertCanManage(user, current);
    const job = await this.repository.findAggregateById(id);
    if (!job) throw new AppError('CONTENT_NOT_FOUND');
    job.withdraw();
    if (!(await this.repository.saveAggregate(job))) throw new AppError('CONTENT_NOT_FOUND');
    const withdrawn = await this.repository.getForAuthorization(id);
    if (!withdrawn) throw new AppError('CONTENT_NOT_FOUND');

    return withdrawn;
  }
}
