import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { ResourceIdentityStore } from '@/shared/infrastructure/database/drizzle/resource-identity.store';
import { jobsSchema } from '@/shared/infrastructure/database/drizzle/schema/job/job.schema';
import { organizationsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/organization/organizations.schema';
import type { JobDTO, ListJobsDTO, PaginatedJobsDTO } from '@/modules/job/application/dtos';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import { JobQueryRepository } from '@/modules/job/application/ports/repositories/job.query.repository';
import type { JobSearchCriteria } from '@/modules/job/application/ports/repositories/job-search.criteria';
import { OrganizationPublicServicePort } from '@/modules/organization/public/organization-public.service';
import { Job } from '@/modules/job/domain/job';
import { resourceTagAssignmentsSchema, tagsSchema } from '@/shared/infrastructure/database/drizzle/schema';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleJobRepository implements JobRepository, JobQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly organizations: OrganizationPublicServicePort,
    private readonly resources: ResourceIdentityStore,
  ) {}

  async findAggregateById(id: string): Promise<Job | null> {
    const current = await this.getForAuthorization(id);
    if (!current) return null;

    return Job.rehydrate({ ...current, tagSlugs: undefined } as never);
  }

  async saveAggregate(job: Job, context?: unknown): Promise<boolean> {
    const state = job.snapshot();
    const executor = (context as Executor | undefined) ?? this.db;
    const [row] = await executor
      .update(jobsSchema)
      .set({
        title: state.title,
        description: state.description,
        employmentType: state.employmentType,
        workplaceType: state.workplaceType,
        location: state.location,
        compensationMin: state.compensationMin,
        compensationMax: state.compensationMax,
        compensationCurrency: state.compensationCurrency,
        compensationUnit: state.compensationUnit,
        applicationUrl: state.applicationUrl,
        sourceUrl: state.sourceUrl,
        status: state.status,
        publishedAt: state.publishedAt,
        expiresAt: state.expiresAt,
        closedAt: state.closedAt,
        withdrawnAt: state.withdrawnAt,
        hiddenAt: state.hiddenAt,
        deletedAt: state.deletedAt,
        updatedAt: state.updatedAt,
      })
      .where(eq(jobsSchema.id, state.id))
      .returning({ id: jobsSchema.id });

    return Boolean(row);
  }

  async transaction<T>(work: (context: unknown) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => work(tx));
  }

  async activeCount(accountId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(jobsSchema)
      .where(
        and(
          eq(jobsSchema.publisherOrganizationId, accountId),
          eq(jobsSchema.status, 'published'),
          gt(jobsSchema.expiresAt, new Date().toISOString()),
        ),
      );

    return Number(row?.value ?? 0);
  }

  async existsActiveDuplicate(accountId: string, title: string, applicationUrl: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: jobsSchema.id })
      .from(jobsSchema)
      .where(
        and(
          eq(jobsSchema.publisherOrganizationId, accountId),
          eq(jobsSchema.status, 'published'),
          gt(jobsSchema.expiresAt, new Date().toISOString()),
          or(eq(jobsSchema.title, title.trim()), eq(jobsSchema.applicationUrl, applicationUrl)),
        ),
      );

    return Boolean(row);
  }

  async createAggregateWithinActiveLimit(
    job: Job,
    maxActive: number,
    context?: unknown,
  ): Promise<Omit<JobDTO, 'tagSlugs'> | null> {
    const persist = async (executor: Executor) => {
      const state = job.snapshot();
      executor.select({
        lock: sql`pg_advisory_xact_lock(hashtextextended(${state.publisherOrganizationId!}, 2))`,
      });
      const nowIso = new Date().toISOString();
      const [active] = await executor
        .select({ value: count() })
        .from(jobsSchema)
        .where(
          and(
            eq(jobsSchema.publisherOrganizationId, state.publisherOrganizationId!),
            eq(jobsSchema.status, 'published'),
            gt(jobsSchema.expiresAt, nowIso),
          ),
        );
      if (Number(active?.value ?? 0) >= maxActive) return null;

      await this.resources.assertKind(state.id, 'job', executor);
      const [row] = await executor.insert(jobsSchema).values(state).returning();
      if (!row) throw new Error('JOB_NOT_PERSISTED');

      return this.withPublisher({ ...row, tagSlugs: [], publisher: null });
    };
    if (context) return persist(context as Executor);

    return this.db.transaction((tx) => persist(tx));
  }

  async createAggregate(job: Job, context?: unknown): Promise<Omit<JobDTO, 'tagSlugs'>> {
    const executor = (context as Executor | undefined) ?? this.db;
    const state = job.snapshot();
    await this.resources.assertKind(state.id, 'job', executor);
    const [row] = await executor.insert(jobsSchema).values(state).returning();
    if (!row) throw new Error('JOB_NOT_PERSISTED');

    return this.withPublisher({ ...row, tagSlugs: [], publisher: null });
  }

  async list(input: ListJobsDTO, accountId?: string): Promise<PaginatedJobsDTO> {
    const page = Math.max(1, Number(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(input.pageSize || 20)));
    const offset = (page - 1) * pageSize;
    const filters = accountId
      ? [eq(jobsSchema.publisherOrganizationId, accountId), isNull(jobsSchema.deletedAt)]
      : [
          eq(jobsSchema.status, 'published'),
          gt(jobsSchema.expiresAt, new Date().toISOString()),
          isNull(jobsSchema.hiddenAt),
          isNull(jobsSchema.deletedAt),
        ];
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
    if (input.search)
      filters.push(
        or(ilike(jobsSchema.title, `%${input.search}%`), ilike(jobsSchema.description, `%${input.search}%`))!,
      );
    if (tags.length) filters.push(this.buildTagPredicate(tags));
    if (input.employmentType) filters.push(eq(jobsSchema.employmentType, input.employmentType));
    if (input.workplaceType) filters.push(eq(jobsSchema.workplaceType, input.workplaceType));
    if (input.location) filters.push(ilike(jobsSchema.location, `%${input.location}%`));
    if (input.minComp !== undefined)
      filters.push(
        input.minComp === 0
          ? or(gte(jobsSchema.compensationMin, '0'), isNull(jobsSchema.compensationMin))!
          : gte(jobsSchema.compensationMin, String(input.minComp)),
      );
    if (!accountId && input.publisherOrganizationId)
      filters.push(eq(jobsSchema.publisherOrganizationId, input.publisherOrganizationId));
    const where = and(...filters);
    const itemsQuery = this.db
      .select({
        id: jobsSchema.id,
        publisherOrganizationId: jobsSchema.publisherOrganizationId,
        title: jobsSchema.title,
        description: jobsSchema.description,
        employmentType: jobsSchema.employmentType,
        workplaceType: jobsSchema.workplaceType,
        location: jobsSchema.location,
        compensationMin: jobsSchema.compensationMin,
        compensationMax: jobsSchema.compensationMax,
        compensationCurrency: jobsSchema.compensationCurrency,
        compensationUnit: jobsSchema.compensationUnit,
        applicationUrl: jobsSchema.applicationUrl,
        status: jobsSchema.status,
        publishedAt: jobsSchema.publishedAt,
        sourceUrl: jobsSchema.sourceUrl,
        expiresAt: jobsSchema.expiresAt,
        closedAt: jobsSchema.closedAt,
        withdrawnAt: jobsSchema.withdrawnAt,
        hiddenAt: jobsSchema.hiddenAt,
        createdAt: jobsSchema.createdAt,
        updatedAt: jobsSchema.updatedAt,
        publisher: {
          id: organizationsSchema.id,
          name: organizationsSchema.name,
          slug: organizationsSchema.slug,
          type: organizationsSchema.type,
          avatarUrl: organizationsSchema.avatarUrl,
        },
        total: sql<number>`count(*) over()`,
      })
      .from(jobsSchema)
      .leftJoin(
        organizationsSchema,
        and(
          eq(organizationsSchema.id, jobsSchema.publisherOrganizationId),
          eq(organizationsSchema.status, 'active'),
          isNull(organizationsSchema.deletedAt),
        ),
      )
      .where(where)
      .orderBy(
        accountId
          ? desc(jobsSchema.updatedAt)
          : input.sort === 'comp'
            ? sql`${jobsSchema.compensationMin} desc nulls last`
            : desc(jobsSchema.publishedAt),
        desc(jobsSchema.updatedAt),
      )
      .limit(pageSize)
      .offset(offset);
    const items = await (accountId ? itemsQuery : itemsQuery.$withCache({ config: { ex: 60 }, autoInvalidate: true }));

    return {
      items: items.map(({ total: _total, publisher, ...item }) => ({
        ...item,
        tagSlugs: [],
        publicationType: item.publisherOrganizationId ? 'organization' : 'community',
        publisher: publisher?.id ? publisher : null,
      })),
      page,
      pageSize,
      total: Number(items[0]?.total ?? 0),
    };
  }

  async listManaged(input: ListJobsDTO, _accountId: string, organizationIds: string[]): Promise<PaginatedJobsDTO> {
    const page = Math.max(1, Number(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(input.pageSize || 20)));
    const filters: SQL[] = [isNull(jobsSchema.deletedAt)];
    if (organizationIds.length) filters.push(inArray(jobsSchema.publisherOrganizationId, organizationIds));
    else return { items: [], page, pageSize, total: 0 };
    if (input.search) filters.push(ilike(jobsSchema.title, `%${input.search}%`));
    if (input.employmentType) filters.push(eq(jobsSchema.employmentType, input.employmentType));
    const rows = await this.db
      .select({
        row: jobsSchema,
        publisher: {
          id: organizationsSchema.id,
          name: organizationsSchema.name,
          slug: organizationsSchema.slug,
          type: organizationsSchema.type,
          avatarUrl: organizationsSchema.avatarUrl,
        },
        total: sql<number>`count(*) over()`,
      })
      .from(jobsSchema)
      .leftJoin(
        organizationsSchema,
        and(
          eq(organizationsSchema.id, jobsSchema.publisherOrganizationId),
          eq(organizationsSchema.status, 'active'),
          isNull(organizationsSchema.deletedAt),
        ),
      )
      .where(and(...filters))
      .orderBy(desc(jobsSchema.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      items: rows.map(({ row, publisher, total: _total }) => ({
        ...row,
        tagSlugs: [],
        publicationType: row.publisherOrganizationId ? 'organization' : 'community',
        publisher: publisher?.id ? publisher : null,
      })),
      page,
      pageSize,
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async listForManagement(input: ListJobsDTO): Promise<PaginatedJobsDTO> {
    const page = Math.max(1, Number(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(input.pageSize || 20)));
    const filters: SQL[] = [isNull(jobsSchema.deletedAt)];
    if (input.search) filters.push(ilike(jobsSchema.title, `%${input.search}%`));
    if (input.employmentType) filters.push(eq(jobsSchema.employmentType, input.employmentType));
    const rows = await this.db
      .select({
        id: jobsSchema.id,
        publisherOrganizationId: jobsSchema.publisherOrganizationId,
        title: jobsSchema.title,
        description: jobsSchema.description,
        employmentType: jobsSchema.employmentType,
        workplaceType: jobsSchema.workplaceType,
        location: jobsSchema.location,
        compensationMin: jobsSchema.compensationMin,
        compensationMax: jobsSchema.compensationMax,
        compensationCurrency: jobsSchema.compensationCurrency,
        compensationUnit: jobsSchema.compensationUnit,
        applicationUrl: jobsSchema.applicationUrl,
        status: jobsSchema.status,
        publishedAt: jobsSchema.publishedAt,
        sourceUrl: jobsSchema.sourceUrl,
        expiresAt: jobsSchema.expiresAt,
        closedAt: jobsSchema.closedAt,
        withdrawnAt: jobsSchema.withdrawnAt,
        hiddenAt: jobsSchema.hiddenAt,
        createdAt: jobsSchema.createdAt,
        updatedAt: jobsSchema.updatedAt,
        publisher: {
          id: organizationsSchema.id,
          name: organizationsSchema.name,
          slug: organizationsSchema.slug,
          type: organizationsSchema.type,
          avatarUrl: organizationsSchema.avatarUrl,
        },
        total: sql<number>`count(*) over()`,
      })
      .from(jobsSchema)
      .leftJoin(
        organizationsSchema,
        and(
          eq(organizationsSchema.id, jobsSchema.publisherOrganizationId),
          eq(organizationsSchema.status, 'active'),
          isNull(organizationsSchema.deletedAt),
        ),
      )
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(jobsSchema.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      items: rows.map(({ total: _total, publisher, ...row }) => ({
        ...row,
        tagSlugs: [],
        publicationType: row.publisherOrganizationId ? 'organization' : 'community',
        publisher: publisher?.id ? publisher : null,
      })),
      page,
      pageSize,
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async get(id: string, _accountId?: string): Promise<Omit<JobDTO, 'tagSlugs'> | null> {
    const [job] = await this.db
      .select()
      .from(jobsSchema)
      .where(
        and(
          eq(jobsSchema.id, id),
          inArray(jobsSchema.status, ['published', 'closed']),
          gt(jobsSchema.expiresAt, new Date().toISOString()),
          isNull(jobsSchema.hiddenAt),
          isNull(jobsSchema.deletedAt),
        ),
      )
      .limit(1);
    if (!job) return null;

    return this.withPublisher({ ...job, tagSlugs: [], publisher: null });
  }

  async findPublicById(id: string): Promise<Omit<JobDTO, 'tagSlugs'> | null> {
    return this.get(id);
  }

  async getForAuthorization(id: string): Promise<Omit<JobDTO, 'tagSlugs'> | null> {
    const [job] = await this.db
      .select()
      .from(jobsSchema)
      .where(and(eq(jobsSchema.id, id), isNull(jobsSchema.deletedAt)))
      .limit(1);

    return job ? this.withPublisher({ ...job, tagSlugs: [], publisher: null }) : null;
  }

  async findForAuthorization(id: string): Promise<Omit<JobDTO, 'tagSlugs'> | null> {
    return this.getForAuthorization(id);
  }

  async search(criteria: JobSearchCriteria): Promise<PaginatedJobsDTO> {
    return this.list(this.toListInput(criteria));
  }

  async searchManaged(
    criteria: JobSearchCriteria,
    accountId: string,
    organizationIds: string[],
  ): Promise<PaginatedJobsDTO> {
    return this.listManaged(this.toListInput(criteria), accountId, organizationIds);
  }

  async searchForManagement(criteria: JobSearchCriteria): Promise<PaginatedJobsDTO> {
    return this.listForManagement(this.toListInput(criteria));
  }

  async renewAggregateWithinActiveLimit(
    job: Job,
    maxActive: number,
  ): Promise<{ saved: boolean; limitExceeded: boolean }> {
    return this.db.transaction(async (tx) => {
      const state = job.snapshot();
      const previousStatus = state.status;
      if (state.publisherOrganizationId) {
        tx.select({
          lock: sql`pg_advisory_xact_lock(hashtextextended(${state.publisherOrganizationId}, 2))`,
        });
      }

      const now = new Date();
      const nowIso = now.toISOString();
      if (state.publisherOrganizationId) {
        const [activeOthers] = await tx
          .select({ value: count() })
          .from(jobsSchema)
          .where(
            and(
              eq(jobsSchema.publisherOrganizationId, state.publisherOrganizationId),
              eq(jobsSchema.status, 'published'),
              gt(jobsSchema.expiresAt, nowIso),
              ne(jobsSchema.id, state.id),
              isNull(jobsSchema.deletedAt),
            ),
          );
        if (Number(activeOthers?.value ?? 0) >= maxActive) return { saved: false, limitExceeded: true };
      }

      job.renew(now);
      const renewed = job.snapshot();
      const [row] = await tx
        .update(jobsSchema)
        .set({
          status: renewed.status,
          publishedAt: renewed.publishedAt,
          expiresAt: renewed.expiresAt,
          closedAt: renewed.closedAt,
          updatedAt: renewed.updatedAt,
        })
        .where(
          and(
            eq(jobsSchema.id, renewed.id),
            renewed.publisherOrganizationId
              ? eq(jobsSchema.publisherOrganizationId, renewed.publisherOrganizationId)
              : isNull(jobsSchema.publisherOrganizationId),
            eq(jobsSchema.status, previousStatus),
            isNull(jobsSchema.deletedAt),
          ),
        )
        .returning({ id: jobsSchema.id });

      return { saved: Boolean(row), limitExceeded: false };
    });
  }

  async listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>> {
    const rows = await this.db
      .select({ id: jobsSchema.id, hiddenAt: jobsSchema.hiddenAt })
      .from(jobsSchema)
      .where(isNotNull(jobsSchema.hiddenAt));

    return rows.flatMap((row) => (row.hiddenAt ? [{ id: row.id, hiddenAt: row.hiddenAt }] : []));
  }

  private async withPublisher(job: Omit<JobDTO, 'publicationType'>): Promise<JobDTO> {
    const publisher = job.publisherOrganizationId
      ? await this.organizations.getById(job.publisherOrganizationId)
      : null;

    return {
      ...job,
      publicationType: job.publisherOrganizationId ? 'organization' : 'community',
      publisher,
    };
  }

  private buildTagPredicate(tagSlugs: string[]): SQL {
    const matchingJobIds = this.db
      .select({ resourceId: resourceTagAssignmentsSchema.resourceId })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(
        tagsSchema,
        and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')),
      )
      .where(inArray(tagsSchema.slug, tagSlugs))
      .groupBy(resourceTagAssignmentsSchema.resourceId)
      .having(eq(countDistinct(tagsSchema.slug), tagSlugs.length));

    return inArray(jobsSchema.id, matchingJobIds);
  }

  private toListInput(criteria: JobSearchCriteria): ListJobsDTO {
    const { tags, ...rest } = criteria;
    const input: ListJobsDTO = {
      ...rest,
      page: criteria.page ?? 1,
      pageSize: criteria.pageSize ?? 20,
    };
    if (tags?.length) input.tags = tags.join(',');

    return input;
  }

  async resolve(id: string) {
    const [row] = await this.db
      .select({
        id: jobsSchema.id,
        status: jobsSchema.status,
        expiresAt: jobsSchema.expiresAt,
        hiddenAt: jobsSchema.hiddenAt,
      })
      .from(jobsSchema)
      .where(and(eq(jobsSchema.id, id), isNull(jobsSchema.deletedAt)));

    return row;
  }
}
