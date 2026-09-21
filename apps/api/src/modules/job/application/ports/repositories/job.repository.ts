import type { JobDTO, ListJobsDTO, PaginatedJobsDTO } from '../../dtos';
import type { Job } from '@/modules/job/domain/job';

export abstract class JobRepository {
  abstract findAggregateById(id: string): Promise<Job | null>;
  abstract saveAggregate(job: Job, context?: unknown): Promise<boolean>;
  abstract transaction<T>(work: (context: unknown) => Promise<T>): Promise<T>;
  abstract activeCount(accountId: string): Promise<number>;
  abstract existsActiveDuplicate(accountId: string, title: string, applicationUrl: string): Promise<boolean>;
  abstract createAggregateWithinActiveLimit(
    job: Job,
    maxActive: number,
    context?: unknown,
  ): Promise<Omit<JobDTO, 'tagSlugs'> | null>;
  abstract createAggregate(job: Job, context?: unknown): Promise<Omit<JobDTO, 'tagSlugs'>>;
  abstract list(input: ListJobsDTO, accountId?: string): Promise<PaginatedJobsDTO>;
  abstract listManaged(input: ListJobsDTO, accountId: string, organizationIds: string[]): Promise<PaginatedJobsDTO>;
  abstract listForManagement(input: ListJobsDTO): Promise<PaginatedJobsDTO>;
  abstract get(id: string, accountId?: string): Promise<Omit<JobDTO, 'tagSlugs'> | null>;
  abstract getForAuthorization(id: string): Promise<Omit<JobDTO, 'tagSlugs'> | null>;
  abstract renewAggregateWithinActiveLimit(
    job: Job,
    maxActive: number,
  ): Promise<{ saved: boolean; limitExceeded: boolean }>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
  abstract resolve(
    id: string,
  ): Promise<{ id: string; status: JobDTO['status']; expiresAt: string; hiddenAt: string | null } | null>;
}
