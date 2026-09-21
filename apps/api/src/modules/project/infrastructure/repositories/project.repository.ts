import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, countDistinct, desc, eq, ilike, inArray, isNotNull, isNull, ne, or, sql, type SQL } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { resolveUniqueSlug } from '@/shared/kernel/slug/unique-slug';
import type { ListProjectsDTO, PaginatedProjectsDTO, ProjectDTO } from '@/modules/project/application/dtos';
import {
  ProjectRepository,
  type ProjectModerationAction,
  type ProjectResolution,
  type ProjectWriteInput,
} from '@/modules/project/application/ports/repositories/project.repository';
import { ProjectQueryRepository } from '@/modules/project/application/ports/repositories/project.query.repository';
import type { ProjectSearchCriteria } from '@/modules/project/application/ports/repositories/project-search.criteria';
import { projectsSchema } from '@/shared/infrastructure/database/drizzle/schema/project/project.schema';
import { resourcesSchema } from '@/shared/infrastructure/database/drizzle/schema/resource/resources.schema';
import { resourceTagAssignmentsSchema, tagsSchema } from '@/shared/infrastructure/database/drizzle/schema';
import { AccountProfileReadPort } from '@/modules/account/public/account-profile-read.port';
import { Project } from '@/modules/project/domain/project';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleProjectRepository implements ProjectRepository, ProjectQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly profiles: AccountProfileReadPort,
  ) {}

  async transaction<T>(work: (context: unknown) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => work(tx));
  }

  async create(id: string, authorAccountId: string, input: ProjectWriteInput, context?: unknown): Promise<ProjectDTO>;
  async create(authorAccountId: string, input: ProjectWriteInput): Promise<ProjectDTO>;
  async create(
    idOrAuthorAccountId: string,
    authorAccountIdOrInput: string | ProjectWriteInput,
    inputOrContext?: unknown,
    context?: unknown,
  ): Promise<ProjectDTO> {
    const legacySignature = typeof authorAccountIdOrInput !== 'string';
    const id = legacySignature ? randomUUID() : idOrAuthorAccountId;
    const authorAccountId = legacySignature ? idOrAuthorAccountId : authorAccountIdOrInput;
    const input = (legacySignature ? authorAccountIdOrInput : inputOrContext) as ProjectWriteInput;
    const transactionContext = legacySignature ? undefined : context;
    const executor = (transactionContext as Executor | undefined) ?? this.db;
    if (legacySignature) await executor.insert(resourcesSchema).values({ id, kind: 'project' });
    const slug = await resolveUniqueSlug(
      input.title,
      (candidate) => this.slugExists(candidate, undefined, executor),
      180,
      'content',
    );
    const project = Project.create({
      id,
      authorAccountId,
      slug,
      ...input,
      projectUrl: input.projectUrl ?? null,
      repositoryUrl: input.repositoryUrl ?? null,
    });
    const [row] = await executor.insert(projectsSchema).values(project.value).returning();
    if (!row) throw new Error('PROJECT_NOT_PERSISTED');

    return this.withAuthor(this.toDTO(row));
  }

  async update(
    id: string,
    inputOrAccountId: Partial<ProjectWriteInput> | string,
    contextOrInput?: unknown,
    context?: unknown,
  ): Promise<ProjectDTO | null> {
    const accountId = typeof inputOrAccountId === 'string' ? inputOrAccountId : undefined;
    const input = (
      typeof inputOrAccountId === 'string' ? contextOrInput : inputOrAccountId
    ) as Partial<ProjectWriteInput>;
    const transactionContext = typeof inputOrAccountId === 'string' ? context : contextOrInput;
    const executor = (transactionContext as Executor | undefined) ?? this.db;
    const [current] = await executor
      .select()
      .from(projectsSchema)
      .where(
        and(
          eq(projectsSchema.id, id),
          isNull(projectsSchema.deletedAt),
          accountId ? eq(projectsSchema.authorAccountId, accountId) : undefined,
        ),
      )
      .limit(1);
    if (!current) return null;
    const project = Project.rehydrate(current);
    project.update(input);
    const state = project.value;
    const values: Partial<typeof projectsSchema.$inferInsert> = {
      title: state.title,
      summary: state.summary,
      description: state.description,
      projectUrl: state.projectUrl,
      repositoryUrl: state.repositoryUrl,
      updatedAt: state.updatedAt,
    };
    const [row] = await executor
      .update(projectsSchema)
      .set(values)
      .where(
        and(
          eq(projectsSchema.id, id),
          isNull(projectsSchema.deletedAt),
          accountId ? eq(projectsSchema.authorAccountId, accountId) : undefined,
        ),
      )
      .returning();

    return row ? this.withAuthor(this.toDTO(row)) : null;
  }

  async get(key: string, authorAccountId?: string): Promise<ProjectDTO | null> {
    const visibility = authorAccountId
      ? or(
          and(eq(projectsSchema.status, 'published'), isNull(projectsSchema.hiddenAt)),
          eq(projectsSchema.authorAccountId, authorAccountId),
        )
      : and(eq(projectsSchema.status, 'published'), isNull(projectsSchema.hiddenAt));
    // PostgreSQL attempts to cast the slug to uuid when both predicates are
    // combined with OR. A public slug is not a UUID, so build the predicate
    // according to the key shape and keep a slug lookup from failing with a
    // database cast error.
    const keyFilter = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)
      ? or(eq(projectsSchema.id, key), eq(projectsSchema.slug, key))
      : eq(projectsSchema.slug, key);
    const [row] = await this.db
      .select()
      .from(projectsSchema)
      .where(and(keyFilter, visibility, isNull(projectsSchema.deletedAt)))
      .limit(1);

    return row ? this.withAuthor(this.toDTO(row)) : null;
  }

  async findBySlug(slug: string, authorAccountId?: string): Promise<ProjectDTO | null> {
    return this.get(slug, authorAccountId);
  }

  async getById(id: string): Promise<ProjectDTO | null> {
    const [row] = await this.db
      .select()
      .from(projectsSchema)
      .where(and(eq(projectsSchema.id, id), isNull(projectsSchema.deletedAt)))
      .limit(1);

    return row ? this.withAuthor(this.toDTO(row)) : null;
  }

  async findById(id: string): Promise<ProjectDTO | null> {
    return this.getById(id);
  }

  async search(criteria: ProjectSearchCriteria): Promise<PaginatedProjectsDTO> {
    return this.list(this.toListInput(criteria));
  }

  async searchManaged(criteria: ProjectSearchCriteria, accountId: string): Promise<PaginatedProjectsDTO> {
    return this.listManaged(this.toListInput(criteria), accountId);
  }

  async searchForManagement(criteria: ProjectSearchCriteria): Promise<PaginatedProjectsDTO> {
    return this.listForManagement(this.toListInput(criteria));
  }

  async list(input: ListProjectsDTO, authorAccountId?: string): Promise<PaginatedProjectsDTO> {
    const page = Math.max(1, Number(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(input.pageSize || 20)));
    const filters = [isNull(projectsSchema.deletedAt)];
    if (authorAccountId) {
      filters.push(
        eq(projectsSchema.authorAccountId, authorAccountId),
        eq(projectsSchema.status, 'published'),
        isNull(projectsSchema.hiddenAt),
      );
    } else {
      filters.push(eq(projectsSchema.status, 'published'));
      filters.push(isNull(projectsSchema.hiddenAt));
      if (input.authorAccountId) filters.push(eq(projectsSchema.authorAccountId, input.authorAccountId));
    }
    const tags = input.tags
      ? [
          ...new Set(
            input.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        ]
      : [];
    if (tags.length) filters.push(this.buildTagPredicate(tags));
    if (input.search)
      filters.push(
        or(
          ilike(projectsSchema.title, `%${input.search}%`),
          ilike(projectsSchema.summary, `%${input.search}%`),
          ilike(projectsSchema.description, `%${input.search}%`),
        )!,
      );
    const where = and(...filters);
    const itemsQuery = this.db
      .select({
        id: projectsSchema.id,
        authorAccountId: projectsSchema.authorAccountId,
        title: projectsSchema.title,
        slug: projectsSchema.slug,
        summary: projectsSchema.summary,
        description: projectsSchema.description,
        projectUrl: projectsSchema.projectUrl,
        repositoryUrl: projectsSchema.repositoryUrl,
        status: projectsSchema.status,
        publishedAt: projectsSchema.publishedAt,
        hiddenAt: projectsSchema.hiddenAt,
        createdAt: projectsSchema.createdAt,
        updatedAt: projectsSchema.updatedAt,
        deletedAt: projectsSchema.deletedAt,
        total: sql<number>`count(*) over()`,
      })
      .from(projectsSchema)
      .where(where)
      .orderBy(
        authorAccountId
          ? desc(projectsSchema.updatedAt)
          : input.sort === 'title'
            ? projectsSchema.title
            : desc(projectsSchema.publishedAt),
        desc(projectsSchema.updatedAt),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const items = await itemsQuery.$withCache({ config: { ex: 60 }, autoInvalidate: true });

    return {
      items: await this.withAuthors(items.map((row) => this.toDTO(row))),
      page,
      pageSize,
      total: Number(items[0]?.total ?? 0),
    };
  }

  async listManaged(input: ListProjectsDTO, accountId: string): Promise<PaginatedProjectsDTO> {
    const page = Math.max(1, Number(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(input.pageSize || 20)));
    const filters = [eq(projectsSchema.authorAccountId, accountId), isNull(projectsSchema.deletedAt)];
    if (input.search)
      filters.push(
        or(ilike(projectsSchema.title, `%${input.search}%`), ilike(projectsSchema.summary, `%${input.search}%`))!,
      );
    const rows = await this.db
      .select({ row: projectsSchema, total: sql<number>`count(*) over()` })
      .from(projectsSchema)
      .where(and(...filters))
      .orderBy(desc(projectsSchema.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      items: await this.withAuthors(rows.map(({ row }) => this.toDTO(row))),
      page,
      pageSize,
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async listForManagement(input: ListProjectsDTO): Promise<PaginatedProjectsDTO> {
    const page = Math.max(1, Number(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(input.pageSize || 20)));
    const filters = [isNull(projectsSchema.deletedAt)];
    if (input.search)
      filters.push(
        or(ilike(projectsSchema.title, `%${input.search}%`), ilike(projectsSchema.summary, `%${input.search}%`))!,
      );
    const rows = await this.db
      .select({
        id: projectsSchema.id,
        authorAccountId: projectsSchema.authorAccountId,
        title: projectsSchema.title,
        slug: projectsSchema.slug,
        summary: projectsSchema.summary,
        description: projectsSchema.description,
        projectUrl: projectsSchema.projectUrl,
        repositoryUrl: projectsSchema.repositoryUrl,
        status: projectsSchema.status,
        publishedAt: projectsSchema.publishedAt,
        hiddenAt: projectsSchema.hiddenAt,
        createdAt: projectsSchema.createdAt,
        updatedAt: projectsSchema.updatedAt,
        deletedAt: projectsSchema.deletedAt,
        total: sql<number>`count(*) over()`,
      })
      .from(projectsSchema)
      .where(and(...filters))
      .orderBy(desc(projectsSchema.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      items: await this.withAuthors(rows.map((row) => this.toDTO(row))),
      page,
      pageSize,
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async publish(id: string, accountId?: string): Promise<ProjectDTO | null> {
    return this.setStatus(id, 'draft', 'published', accountId);
  }

  async archive(id: string, accountId?: string): Promise<ProjectDTO | null> {
    return this.setStatus(id, 'published', 'archived', accountId);
  }

  async unarchive(id: string, accountId?: string): Promise<ProjectDTO | null> {
    return this.setStatus(id, 'archived', 'published', accountId);
  }

  async remove(id: string, accountId?: string): Promise<boolean> {
    const ownership = and(
      eq(projectsSchema.id, id),
      isNull(projectsSchema.deletedAt),
      accountId ? eq(projectsSchema.authorAccountId, accountId) : undefined,
    );
    const [current] = await this.db.select().from(projectsSchema).where(ownership).limit(1);
    if (!current) return false;
    const project = Project.rehydrate(current);
    project.delete();
    const state = project.value;
    const rows = await this.db
      .update(projectsSchema)
      .set({ deletedAt: state.deletedAt, updatedAt: state.updatedAt })
      .where(ownership)
      .returning({ id: projectsSchema.id });

    return rows.length > 0;
  }

  async archiveAllByAuthor(authorAccountId: string): Promise<number> {
    const rows = await this.db
      .update(projectsSchema)
      .set({ status: 'archived', updatedAt: new Date().toISOString() })
      .where(and(eq(projectsSchema.authorAccountId, authorAccountId), isNull(projectsSchema.deletedAt)))
      .returning({ id: projectsSchema.id });

    return rows.length;
  }

  async moderate(id: string, action: ProjectModerationAction): Promise<boolean> {
    const [current] = await this.db
      .select()
      .from(projectsSchema)
      .where(and(eq(projectsSchema.id, id), isNull(projectsSchema.deletedAt)))
      .limit(1);
    if (!current || current.deletedAt) return false;
    const project = Project.rehydrate(current);
    if (action === 'hide') project.hide();
    else project.unhide();
    const state = project.value;
    const rows = await this.db
      .update(projectsSchema)
      .set({ hiddenAt: state.hiddenAt, updatedAt: state.updatedAt })
      .where(and(eq(projectsSchema.id, id), isNull(projectsSchema.deletedAt)))
      .returning({ id: projectsSchema.id });

    return rows.length > 0;
  }

  async listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>> {
    const rows = await this.db
      .select({ id: projectsSchema.id, hiddenAt: projectsSchema.hiddenAt })
      .from(projectsSchema)
      .where(and(isNotNull(projectsSchema.hiddenAt), isNull(projectsSchema.deletedAt)));

    return rows.flatMap((row) => (row.hiddenAt ? [{ id: row.id, hiddenAt: row.hiddenAt }] : []));
  }

  async resolve(id: string): Promise<ProjectResolution | null> {
    const [row] = await this.db
      .select({
        authorAccountId: projectsSchema.authorAccountId,
        status: projectsSchema.status,
        hiddenAt: projectsSchema.hiddenAt,
        deletedAt: projectsSchema.deletedAt,
      })
      .from(projectsSchema)
      .where(eq(projectsSchema.id, id))
      .limit(1);

    return row ?? null;
  }

  private buildTagPredicate(tagSlugs: string[]): SQL {
    const matchingProjectIds = this.db
      .select({ resourceId: resourceTagAssignmentsSchema.resourceId })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(
        tagsSchema,
        and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')),
      )
      .where(inArray(tagsSchema.slug, tagSlugs))
      .groupBy(resourceTagAssignmentsSchema.resourceId)
      .having(eq(countDistinct(tagsSchema.slug), tagSlugs.length));

    return inArray(projectsSchema.id, matchingProjectIds);
  }

  private toListInput(criteria: ProjectSearchCriteria): ListProjectsDTO {
    const { tags, ...rest } = criteria;
    const input: ListProjectsDTO = {
      ...rest,
      page: criteria.page ?? 1,
      pageSize: criteria.pageSize ?? 20,
    };
    if (tags?.length) input.tags = tags.join(',');

    return input;
  }

  private async setStatus(
    id: string,
    expectedStatus: ProjectDTO['status'],
    status: ProjectDTO['status'],
    accountId?: string,
  ): Promise<ProjectDTO | null> {
    const [current] = await this.db
      .select()
      .from(projectsSchema)
      .where(
        and(
          eq(projectsSchema.id, id),
          eq(projectsSchema.status, expectedStatus),
          isNull(projectsSchema.deletedAt),
          accountId ? eq(projectsSchema.authorAccountId, accountId) : undefined,
        ),
      )
      .limit(1);
    if (!current) return null;
    const project = Project.rehydrate(current);
    if (expectedStatus === 'draft' && status === 'published') project.publish();
    else if (expectedStatus === 'published' && status === 'archived') project.archive();
    else if (expectedStatus === 'archived' && status === 'published') project.unarchive();
    else throw new Error('PROJECT_INVALID_STATUS_TRANSITION');
    const state = project.value;
    const [row] = await this.db
      .update(projectsSchema)
      .set({ status: state.status, publishedAt: state.publishedAt, updatedAt: state.updatedAt })
      .where(
        and(
          eq(projectsSchema.id, id),
          eq(projectsSchema.status, expectedStatus),
          isNull(projectsSchema.deletedAt),
          accountId ? eq(projectsSchema.authorAccountId, accountId) : undefined,
        ),
      )
      .returning();

    return row ? this.withAuthor(this.toDTO(row)) : null;
  }

  private async withAuthor(project: ProjectDTO): Promise<ProjectDTO> {
    const profiles = await this.profiles.getProfilesByAccountIds([project.authorAccountId]);
    const profile = profiles[project.authorAccountId];

    return {
      ...project,
      author: profile
        ? { username: profile.username, displayName: profile.displayName, avatarUrl: profile.avatarUrl }
        : null,
    };
  }

  private async withAuthors(projects: ProjectDTO[]): Promise<ProjectDTO[]> {
    const profiles = await this.profiles.getProfilesByAccountIds(projects.map((project) => project.authorAccountId));

    return projects.map((project) => {
      const profile = profiles[project.authorAccountId];

      return {
        ...project,
        author: profile
          ? { username: profile.username, displayName: profile.displayName, avatarUrl: profile.avatarUrl }
          : null,
      };
    });
  }

  private async slugExists(slug: string, excludeId?: string, executor: Executor = this.db): Promise<boolean> {
    const condition = excludeId
      ? and(eq(projectsSchema.slug, slug), ne(projectsSchema.id, excludeId))
      : eq(projectsSchema.slug, slug);
    const rows = await executor.select({ id: projectsSchema.id }).from(projectsSchema).where(condition).limit(1);

    return rows.length > 0;
  }

  private toDTO(row: typeof projectsSchema.$inferSelect): ProjectDTO {
    return { ...row, tagSlugs: [], author: null };
  }
}
