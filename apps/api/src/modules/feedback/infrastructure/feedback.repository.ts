import { Injectable, Inject } from '@nestjs/common';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { feedbackSchema } from '@/shared/infrastructure/database/drizzle/schema/communication/feedback.schema';
import { FeedbackRepository } from '../application/ports/feedback.repository';
import type { FeedbackDTO, FeedbackStatus, ListFeedbackDTO } from '../application/dtos';
import type { Paginated } from '@/shared/kernel/pagination';
import { Feedback } from '../domain';

@Injectable()
export class DrizzleFeedbackRepository implements FeedbackRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}
  async create(feedback: Feedback, idempotencyKey?: string) {
    const input = feedback.value;
    const [row] = await this.db
      .insert(feedbackSchema)
      .values({
        id: input.id,
        reporterAccountId: input.reporterAccountId,
        idempotencyKey: idempotencyKey ?? null,
        category: input.category,
        description: input.description,
        contextUrl: input.contextUrl,
        screenshotMediaId: input.screenshotMediaId,
      })
      .onConflictDoNothing({ target: [feedbackSchema.reporterAccountId, feedbackSchema.idempotencyKey] })
      .returning();
    if (!row && idempotencyKey) {
      const [existing] = await this.db
        .select()
        .from(feedbackSchema)
        .where(
          and(
            input.reporterAccountId
              ? eq(feedbackSchema.reporterAccountId, input.reporterAccountId)
              : isNull(feedbackSchema.reporterAccountId),
            eq(feedbackSchema.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      if (existing) return existing as FeedbackDTO;
    }
    if (!row) throw new Error('FEEDBACK_CREATE_FAILED');

    return row as FeedbackDTO;
  }

  async listForAdministration(query: ListFeedbackDTO): Promise<Paginated<FeedbackDTO>> {
    const page = Math.max(1, Number(query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20)));
    const filters = query.status ? [eq(feedbackSchema.status, query.status)] : [];
    const rows = await this.db
      .select({ row: feedbackSchema, total: sql<number>`count(*) over()` })
      .from(feedbackSchema)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(feedbackSchema.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return { items: rows.map(({ row }) => row), page, pageSize, total: Number(rows[0]?.total ?? 0) };
  }

  async findById(id: string): Promise<Feedback | null> {
    const [row] = await this.db.select().from(feedbackSchema).where(eq(feedbackSchema.id, id)).limit(1);

    return row ? Feedback.rehydrate(row) : null;
  }

  async save(feedback: Feedback): Promise<FeedbackDTO | null> {
    const state = feedback.value;
    const [row] = await this.db
      .update(feedbackSchema)
      .set({ status: state.status, internalSeverity: state.internalSeverity, resolvedAt: state.resolvedAt })
      .where(eq(feedbackSchema.id, state.id))
      .returning();

    return row ?? null;
  }

  async updateStatus(id: string, status: FeedbackStatus): Promise<FeedbackDTO | null> {
    const [current] = await this.db
      .select({ status: feedbackSchema.status })
      .from(feedbackSchema)
      .where(eq(feedbackSchema.id, id))
      .limit(1);
    if (!current) return null;
    const allowed: Record<string, readonly string[]> = {
      open: ['in_review'],
      in_review: ['resolved', 'dismissed'],
      resolved: [],
      dismissed: [],
    };
    if (!allowed[current.status]?.includes(status)) return null;
    const [row] = await this.db
      .update(feedbackSchema)
      .set({ status, resolvedAt: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null })
      .where(eq(feedbackSchema.id, id))
      .returning();

    return row ?? null;
  }
}
