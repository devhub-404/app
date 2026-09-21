import { Inject, Injectable } from '@nestjs/common';
import { and, eq, notExists, or } from 'drizzle-orm';
import type { DrizzleDatabaseService } from './db';
import { resourcesSchema } from './schema/resource/resources.schema';
import { articlesSchema } from './schema/article/articles.schema';
import { newsSchema } from './schema/news/news.schema';
import { externalResourcesSchema } from './schema/external-resource/external-resources.schema';
import { projectsSchema } from './schema/project/project.schema';
import { eventsSchema } from './schema/event/events.schema';
import { jobsSchema } from './schema/job/job.schema';
import { answersSchema, questionsSchema } from './schema/q-and-a/q-and-a.schema';
import type { ResourceIdentity, ResourceKind } from '@/shared/kernel/resource/resource-identity';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class ResourceIdentityStore extends ResourceIdentityPort {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {
    super();
  }

  async create(kind: ResourceKind, context?: unknown): Promise<ResourceIdentity> {
    const executor = (context as Executor | undefined) ?? this.db;
    const [row] = await executor.insert(resourcesSchema).values({ kind }).returning();
    if (!row) throw new Error('RESOURCE_IDENTITY_NOT_PERSISTED');

    return row;
  }

  async get(id: string, context?: unknown): Promise<ResourceIdentity | null> {
    const executor = (context as Executor | undefined) ?? this.db;
    const [row] = await executor.select().from(resourcesSchema).where(eq(resourcesSchema.id, id)).limit(1);

    return row ?? null;
  }

  async assertKind(id: string, kind: ResourceKind, context?: unknown): Promise<void> {
    const executor = (context as Executor | undefined) ?? this.db;
    const [row] = await executor
      .select({ id: resourcesSchema.id })
      .from(resourcesSchema)
      .where(and(eq(resourcesSchema.id, id), eq(resourcesSchema.kind, kind)))
      .limit(1);
    if (!row) throw new Error('RESOURCE_IDENTITY_KIND_MISMATCH');
  }

  async removeOrphans(context?: unknown): Promise<number> {
    const executor = (context as Executor | undefined) ?? this.db;
    const rows = await executor
      .delete(resourcesSchema)
      .where(
        or(
          and(
            eq(resourcesSchema.kind, 'article'),
            notExists(
              executor
                .select({ id: articlesSchema.id })
                .from(articlesSchema)
                .where(eq(articlesSchema.id, resourcesSchema.id)),
            ),
          ),
          and(
            eq(resourcesSchema.kind, 'news'),
            notExists(
              executor.select({ id: newsSchema.id }).from(newsSchema).where(eq(newsSchema.id, resourcesSchema.id)),
            ),
          ),
          and(
            eq(resourcesSchema.kind, 'external_resource'),
            notExists(
              executor
                .select({ id: externalResourcesSchema.id })
                .from(externalResourcesSchema)
                .where(eq(externalResourcesSchema.id, resourcesSchema.id)),
            ),
          ),
          and(
            eq(resourcesSchema.kind, 'project'),
            notExists(
              executor
                .select({ id: projectsSchema.id })
                .from(projectsSchema)
                .where(eq(projectsSchema.id, resourcesSchema.id)),
            ),
          ),
          and(
            eq(resourcesSchema.kind, 'event'),
            notExists(
              executor
                .select({ id: eventsSchema.id })
                .from(eventsSchema)
                .where(eq(eventsSchema.id, resourcesSchema.id)),
            ),
          ),
          and(
            eq(resourcesSchema.kind, 'job'),
            notExists(
              executor.select({ id: jobsSchema.id }).from(jobsSchema).where(eq(jobsSchema.id, resourcesSchema.id)),
            ),
          ),
          and(
            eq(resourcesSchema.kind, 'question'),
            notExists(
              executor
                .select({ id: questionsSchema.id })
                .from(questionsSchema)
                .where(eq(questionsSchema.id, resourcesSchema.id)),
            ),
          ),
          and(
            eq(resourcesSchema.kind, 'answer'),
            notExists(
              executor
                .select({ id: answersSchema.id })
                .from(answersSchema)
                .where(eq(answersSchema.id, resourcesSchema.id)),
            ),
          ),
        ),
      )
      .returning({ id: resourcesSchema.id });

    return rows.length;
  }

  async remove(id: string, context?: unknown): Promise<void> {
    const executor = (context as Executor | undefined) ?? this.db;
    await executor.delete(resourcesSchema).where(eq(resourcesSchema.id, id));
  }
}
