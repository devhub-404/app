import type { JobSuggestion, JobSuggestionStatus } from '@/modules/job/domain/job-suggestion';

export abstract class JobSuggestionRepository {
  abstract create(suggestion: JobSuggestion, context?: unknown): Promise<string>;
  abstract findById(id: string, context?: unknown): Promise<JobSuggestion | null>;
  abstract save(suggestion: JobSuggestion, expectedStatus: JobSuggestionStatus, context?: unknown): Promise<boolean>;
  abstract listPending(): Promise<JobSuggestion[]>;
  abstract listBySubmitter(accountId: string): Promise<JobSuggestion[]>;
}
