import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import type { AuthenticatedPrincipal } from '@/shared/nest/auth';
import { Role } from '@/shared/kernel/auth/role';
import { JobAccessService } from '../../policies/job-access.service';

@Injectable()
export class DeleteJobCommand {
  constructor(
    private readonly repository: JobRepository,
    private readonly access: JobAccessService,
  ) {}

  async execute(actor: AuthenticatedPrincipal, id: string): Promise<void> {
    const current = await this.repository.getForAuthorization(id);
    if (!current) throw new AppError('CONTENT_NOT_FOUND');
    if (actor.role !== Role.ADMIN) await this.access.assertCanManage(actor, current);
    const job = await this.repository.findAggregateById(id);
    if (!job) throw new AppError('CONTENT_NOT_FOUND');
    job.delete();
    if (!(await this.repository.saveAggregate(job))) throw new AppError('CONTENT_NOT_FOUND');
  }
}
