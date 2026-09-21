import type { PaginatedProjectsDTO, ProjectDTO, SaveProjectDTO } from '../../dtos';
import type { ListProjectsDTO } from '../../dtos/in';

export type ProjectWriteInput = Omit<SaveProjectDTO, 'tagSlugs'>;

export type ProjectModerationAction = 'hide' | 'unhide';
export type ProjectResolution = {
  authorAccountId: string;
  status: ProjectDTO['status'];
  hiddenAt: string | null;
  deletedAt?: Date | string | null;
};

export abstract class ProjectRepository {
  abstract transaction<T>(work: (context: unknown) => Promise<T>): Promise<T>;
  abstract create(
    id: string,
    authorAccountId: string,
    input: ProjectWriteInput,
    context?: unknown,
  ): Promise<ProjectDTO>;
  abstract update(
    id: string,
    input: Partial<ProjectWriteInput> | string,
    contextOrInput?: unknown,
    context?: unknown,
  ): Promise<ProjectDTO | null>;
  abstract get(key: string, authorAccountId?: string): Promise<ProjectDTO | null>;
  abstract getById(id: string): Promise<ProjectDTO | null>;
  abstract list(input: ListProjectsDTO, authorAccountId?: string): Promise<PaginatedProjectsDTO>;
  abstract listManaged(input: ListProjectsDTO, accountId: string): Promise<PaginatedProjectsDTO>;
  abstract listForManagement(input: ListProjectsDTO): Promise<PaginatedProjectsDTO>;
  abstract publish(id: string, accountId?: string): Promise<ProjectDTO | null>;
  abstract archive(id: string, accountId?: string): Promise<ProjectDTO | null>;
  abstract unarchive(id: string, accountId?: string): Promise<ProjectDTO | null>;
  abstract remove(id: string, accountId?: string): Promise<boolean>;
  abstract archiveAllByAuthor(authorAccountId: string): Promise<number>;
  abstract moderate(id: string, action: ProjectModerationAction): Promise<boolean>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
  abstract resolve(id: string): Promise<ProjectResolution | null>;
}
