import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { jobSuggestionsSchema } from '@/shared/infrastructure/database/drizzle/schema/job/job.schema';
import { JobSuggestionRepository } from '@/modules/job/application/ports/repositories/job-suggestion.repository';
import { JobSuggestion, type JobSuggestionStatus } from '@/modules/job/domain/job-suggestion';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleJobSuggestionRepository implements JobSuggestionRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}
  async create(suggestion: JobSuggestion, context?: unknown): Promise<string> {
    const executor = (context as Executor | undefined) ?? this.db;
    const state = suggestion.snapshot();
    const [row] = await executor.insert(jobSuggestionsSchema).values(state).returning({ id: jobSuggestionsSchema.id });
    if (!row) throw new Error('JOB_SUGGESTION_NOT_PERSISTED');

    return row.id;
  }
  async findById(id: string, context?: unknown): Promise<JobSuggestion | null> {
    const executor = (context as Executor | undefined) ?? this.db;
    const [row] = await executor.select().from(jobSuggestionsSchema).where(eq(jobSuggestionsSchema.id, id)).limit(1);

    return row ? JobSuggestion.rehydrate(row) : null;
  }
  async save(suggestion: JobSuggestion, expectedStatus: JobSuggestionStatus, context?: unknown): Promise<boolean> {
    const executor = (context as Executor | undefined) ?? this.db;
    const state = suggestion.snapshot();
    const [row] = await executor
      .update(jobSuggestionsSchema)
      .set({
        status: state.status,
        acceptedJobId: state.acceptedJobId,
        decidedByAccountId: state.decidedByAccountId,
        decisionNote: state.decisionNote,
        decidedAt: state.decidedAt,
      })
      .where(and(eq(jobSuggestionsSchema.id, state.id), eq(jobSuggestionsSchema.status, expectedStatus)))
      .returning({ id: jobSuggestionsSchema.id });

    return Boolean(row);
  }
  async listPending(): Promise<JobSuggestion[]> {
    const rows = await this.db
      .select()
      .from(jobSuggestionsSchema)
      .where(eq(jobSuggestionsSchema.status, 'pending'))
      .orderBy(desc(jobSuggestionsSchema.createdAt));

    return rows.map((r) => JobSuggestion.rehydrate(r));
  }
  async listBySubmitter(accountId: string): Promise<JobSuggestion[]> {
    const rows = await this.db
      .select()
      .from(jobSuggestionsSchema)
      .where(eq(jobSuggestionsSchema.submittedByAccountId, accountId))
      .orderBy(desc(jobSuggestionsSchema.createdAt));

    return rows.map((r) => JobSuggestion.rehydrate(r));
  }
}
