import { Paginated } from '@/shared/kernel/pagination';
import type { JobDTO } from '../../dtos/out/job.dto';
import type { JobSearchCriteria } from './job-search.criteria';

export abstract class JobQueryRepository {
  abstract findPublicById(id: string): Promise<Omit<JobDTO, 'tagSlugs'> | null>;
  abstract findForAuthorization(id: string): Promise<Omit<JobDTO, 'tagSlugs'> | null>;
  abstract search(criteria: JobSearchCriteria): Promise<Paginated<JobDTO>>;
  abstract searchManaged(
    criteria: JobSearchCriteria,
    accountId: string,
    organizationIds: string[],
  ): Promise<Paginated<JobDTO>>;
  abstract searchForManagement(criteria: JobSearchCriteria): Promise<Paginated<JobDTO>>;
  abstract resolve(
    id: string,
  ): Promise<{ id: string; status: JobDTO['status']; expiresAt: string; hiddenAt: string | null } | null>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
}
