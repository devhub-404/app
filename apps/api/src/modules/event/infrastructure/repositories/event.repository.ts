import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, ilike, isNull, lte, or, sql } from 'drizzle-orm';
import { AppError } from '@/shared/errors/app-error';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { eventsSchema } from '@/shared/infrastructure/database/drizzle/schema/event/events.schema';
import { Event, EventStatus } from '../../domain/event';
import { EventRepository } from '../../application/ports/event.repository';
import type { EventDTO, ListEventsDTO, PaginatedEventsDTO } from '../../application/dtos';
import { ResourceIdentityStore } from '@/shared/infrastructure/database/drizzle/resource-identity.store';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleEventRepository implements EventRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly resources: ResourceIdentityStore,
  ) {}

  transaction<T>(work: (context: unknown) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => work(tx));
  }

  async findAggregateById(id: string): Promise<Event | null> {
    const [row] = await this.db
      .select()
      .from(eventsSchema)
      .where(and(eq(eventsSchema.id, id), isNull(eventsSchema.deletedAt)))
      .limit(1);

    return row ? Event.rehydrate(row as never) : null;
  }

  async saveAggregate(event: Event): Promise<boolean> {
    const state = event.value;
    const [row] = await this.db
      .update(eventsSchema)
      .set({
        title: state.title,
        description: state.description,
        coverMediaId: state.coverMediaId,
        url: state.url,
        startsAt: state.startsAt,
        endsAt: state.endsAt,
        format: state.format,
        location: state.location,
        slug: state.slug,
        status: state.status,
        publishedAt: state.publishedAt,
        updatedAt: state.updatedAt,
      })
      .where(and(eq(eventsSchema.id, state.id), isNull(eventsSchema.deletedAt)))
      .returning({ id: eventsSchema.id });

    return Boolean(row);
  }

  async saveNewAggregate(event: Event, context: unknown): Promise<EventDTO> {
    const executor = context as Executor;
    await this.resources.assertKind(event.value.id, 'event', executor);
    const [row] = await executor.insert(eventsSchema).values(event.value).returning();
    if (!row) throw new AppError('CONTENT_NOT_FOUND');

    return this.toDTO(row);
  }

  async eventExistsByUrl(url: string, context: unknown): Promise<boolean> {
    const [row] = await (context as Executor)
      .select({ id: eventsSchema.id })
      .from(eventsSchema)
      .where(and(eq(eventsSchema.url, url), isNull(eventsSchema.deletedAt)))
      .limit(1);

    return Boolean(row);
  }

  async slugExists(slug: string, context?: unknown): Promise<boolean> {
    const [row] = await ((context as Executor | undefined) ?? this.db)
      .select({ id: eventsSchema.id })
      .from(eventsSchema)
      .where(eq(eventsSchema.slug, slug))
      .limit(1);

    return Boolean(row);
  }

  async list(query: ListEventsDTO, management = false): Promise<PaginatedEventsDTO> {
    const page = Math.max(1, Number(query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20)));
    const now = new Date().toISOString();
    const filters = [isNull(eventsSchema.deletedAt)];
    if (!management) {
      filters.push(eq(eventsSchema.status, EventStatus.Published));
    }
    if (query.search)
      filters.push(
        or(
          ilike(eventsSchema.title, `%${query.search}%`),
          ilike(eventsSchema.description, `%${query.search}%`),
          ilike(eventsSchema.location, `%${query.search}%`),
        )!,
      );
    if (query.temporalState === 'upcoming') filters.push(gt(eventsSchema.startsAt, now));
    if (query.temporalState === 'ongoing')
      filters.push(and(lte(eventsSchema.startsAt, now), gt(eventsSchema.endsAt, now))!);
    if (query.temporalState === 'ended') filters.push(lte(eventsSchema.endsAt, now));
    if (query.format) filters.push(eq(eventsSchema.format, query.format as 'online' | 'in_person' | 'hybrid'));
    const rows = await this.db
      .select({ row: eventsSchema, total: sql<number>`count(*) over()` })
      .from(eventsSchema)
      .where(and(...filters))
      .orderBy(query.sort === 'upcoming' ? eventsSchema.startsAt : desc(eventsSchema.startsAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const items = rows.map(({ row }) => this.toDTO(row));

    return { items, page, pageSize, total: Number(rows[0]?.total ?? 0) };
  }

  async listMine(_accountId: string, query: ListEventsDTO): Promise<PaginatedEventsDTO> {
    return this.list(query, false);
  }

  async getBySlug(slug: string): Promise<EventDTO> {
    const [row] = await this.db
      .select()
      .from(eventsSchema)
      .where(
        and(
          eq(eventsSchema.slug, slug),
          eq(eventsSchema.status, EventStatus.Published),
          isNull(eventsSchema.deletedAt),
        ),
      )
      .limit(1);
    if (!row) throw new AppError('CONTENT_NOT_FOUND');

    return this.toDTO(row);
  }

  async resolveAccess(id: string): Promise<Awaited<ReturnType<EventRepository['resolveAccess']>>> {
    const [row] = await this.db
      .select()
      .from(eventsSchema)
      .where(
        and(eq(eventsSchema.id, id), eq(eventsSchema.status, EventStatus.Published), isNull(eventsSchema.deletedAt)),
      )
      .limit(1);
    if (!row) return null;

    return { id: row.id, isPublic: true };
  }

  async getForManagement(id: string): Promise<EventDTO> {
    const [row] = await this.db
      .select()
      .from(eventsSchema)
      .where(and(eq(eventsSchema.id, id), isNull(eventsSchema.deletedAt)))
      .limit(1);
    if (!row) throw new AppError('CONTENT_NOT_FOUND');

    return this.toDTO(row);
  }

  private toDTO(row: typeof eventsSchema.$inferSelect): EventDTO {
    const now = Date.now();
    const starts = new Date(row.startsAt).getTime();
    const ends = new Date(row.endsAt).getTime();
    const temporalState = starts > now ? 'upcoming' : ends > now ? 'ongoing' : 'ended';

    return {
      id: row.id,
      slug: row.slug ?? '',
      status: row.status,
      title: row.title,
      description: row.description,
      coverMediaId: row.coverMediaId,
      url: row.url,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      format: row.format,
      location: row.location,
      publishedAt: row.publishedAt,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      temporalState,
    };
  }
}
