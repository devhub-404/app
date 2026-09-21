import { Paginated } from '@/shared/kernel/pagination';
import type { ProjectDTO } from '../../dtos/out/project.dto';
import type { ProjectSearchCriteria } from './project-search.criteria';

export abstract class ProjectQueryRepository {
  abstract findBySlug(slug: string, authorAccountId?: string): Promise<ProjectDTO | null>;
  abstract findById(id: string): Promise<ProjectDTO | null>;
  abstract search(criteria: ProjectSearchCriteria): Promise<Paginated<ProjectDTO>>;
  abstract searchManaged(criteria: ProjectSearchCriteria, accountId: string): Promise<Paginated<ProjectDTO>>;
  abstract searchForManagement(criteria: ProjectSearchCriteria): Promise<Paginated<ProjectDTO>>;
  abstract resolve(id: string): Promise<{
    authorAccountId: string;
    status: ProjectDTO['status'];
    hiddenAt: string | null;
    deletedAt?: string | Date | null;
  } | null>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
}
