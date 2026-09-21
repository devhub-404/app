import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FeedbackRepository } from '../../ports/feedback.repository';
import type { FeedbackStatus, UpdateFeedbackStatusDTO } from '../../dtos';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class UpdateFeedbackStatusCommand {
  constructor(private readonly feedback: FeedbackRepository) {}

  async execute(id: string, input: FeedbackStatus | UpdateFeedbackStatusDTO) {
    const status = typeof input === 'string' ? input : input.status;
    const aggregate = await this.feedback.findById(id);
    if (!aggregate) throw new AppError('FEEDBACK_INVALID_STATUS');
    try {
      if (typeof input !== 'string' && input.internalSeverity !== undefined)
        aggregate.classify(input.internalSeverity?.trim() || null);
      if (status === 'in_review') aggregate.startReview();
      else if (status === 'resolved') aggregate.resolve();
      else if (status === 'dismissed') aggregate.dismiss();
      else throw new DomainError('FEEDBACK_INVALID_STATUS');
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('FEEDBACK_INVALID_STATUS');

      throw error;
    }
    const updated = await this.feedback.save(aggregate);
    if (!updated) throw new AppError('FEEDBACK_INVALID_STATUS');

    return updated;
  }
}
