import type { FeedbackDTO, FeedbackStatus, ListFeedbackDTO } from '../dtos';
import type { Paginated } from '@/shared/kernel/pagination';
import type { Feedback } from '../../domain';

export abstract class FeedbackRepository {
  abstract create(feedback: Feedback, idempotencyKey?: string): Promise<FeedbackDTO>;
  abstract findById(id: string): Promise<Feedback | null>;
  abstract save(feedback: Feedback): Promise<FeedbackDTO | null>;
  abstract listForAdministration(query: ListFeedbackDTO): Promise<Paginated<FeedbackDTO>>;
  abstract updateStatus(id: string, status: FeedbackStatus): Promise<FeedbackDTO | null>;
}
