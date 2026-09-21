import { DomainError } from '@/shared/errors/domain-error';
import { Job, type JobDetails } from './job';

export type JobSuggestionStatus = 'pending' | 'accepted' | 'rejected';
export type JobSuggestionState = JobDetails & {
  id: string;
  submittedByAccountId: string | null;
  tagSlugs: string[];
  status: JobSuggestionStatus;
  acceptedJobId: string | null;
  decidedByAccountId: string | null;
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
};

export class JobSuggestion {
  private constructor(private readonly state: JobSuggestionState) {}
  static create(
    id: string,
    submittedByAccountId: string,
    details: JobDetails,
    tagSlugs: string[],
    at = new Date(),
  ): JobSuggestion {
    if (!submittedByAccountId) throw new DomainError('JOB_SUGGESTION_INVALID');
    const normalized = Job.normalizeDetails(details);
    Job.validateDetails(normalized);

    return new JobSuggestion({
      ...normalized,
      id,
      submittedByAccountId,
      tagSlugs: [...tagSlugs],
      status: 'pending',
      acceptedJobId: null,
      decidedByAccountId: null,
      decisionNote: null,
      createdAt: at.toISOString(),
      decidedAt: null,
    });
  }
  static rehydrate(state: JobSuggestionState): JobSuggestion {
    return new JobSuggestion({ ...state, tagSlugs: [...state.tagSlugs] });
  }
  accept(jobId: string, reviewerId: string, at = new Date()): void {
    this.decide('accepted', reviewerId, null, at);
    this.state.acceptedJobId = jobId;
  }
  reject(reviewerId: string, note?: string, at = new Date()): void {
    this.decide('rejected', reviewerId, note?.trim() || null, at);
  }
  snapshot(): JobSuggestionState {
    return { ...this.state, tagSlugs: [...this.state.tagSlugs] };
  }
  private decide(
    status: Exclude<JobSuggestionStatus, 'pending'>,
    reviewerId: string,
    note: string | null,
    at: Date,
  ): void {
    if (this.state.status !== 'pending') throw new DomainError('JOB_SUGGESTION_INVALID_STATUS');
    if (!reviewerId) throw new DomainError('JOB_SUGGESTION_INVALID');
    this.state.status = status;
    this.state.decidedByAccountId = reviewerId;
    this.state.decisionNote = note;
    this.state.decidedAt = at.toISOString();
  }
}
