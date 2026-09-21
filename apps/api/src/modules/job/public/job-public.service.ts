import { Injectable } from '@nestjs/common';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import { JobQueryRepository } from '@/modules/job/application/ports/repositories/job.query.repository';
export type JobAccessSnapshot = { isPublic: boolean };

export abstract class JobPublicServicePort {
  abstract resolveAccess(id: string): Promise<JobAccessSnapshot | null>;
  abstract applyModerationAction(id: string, action: 'hide_job' | 'unhide_job'): Promise<void>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
}

@Injectable()
export class JobPublicService implements JobPublicServicePort {
  constructor(
    private readonly repository: JobRepository,
    private readonly query: JobQueryRepository,
  ) {}

  async applyModerationAction(id: string, action: 'hide_job' | 'unhide_job'): Promise<void> {
    const job = await this.repository.findAggregateById(id);
    if (!job) throw new Error('MODERATION_ACTION_NOT_SUPPORTED');
    if (action === 'hide_job') job.hide();
    else job.unhide();
    if (!(await this.repository.saveAggregate(job))) throw new Error('MODERATION_ACTION_NOT_SUPPORTED');
  }

  listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>> {
    return this.query.listHiddenForModeration();
  }

  async resolveAccess(id: string): Promise<JobAccessSnapshot | null> {
    const resolved = await this.query.resolve(id);
    if (!resolved || resolved.status !== 'published' || resolved.hiddenAt || new Date(resolved.expiresAt) <= new Date())
      return null;

    return { isPublic: true };
  }
}
