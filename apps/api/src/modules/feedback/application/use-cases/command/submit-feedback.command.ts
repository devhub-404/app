import { Injectable } from '@nestjs/common';
import { FeedbackRepository } from '../../ports/feedback.repository';
import { SubmitFeedbackDTO } from '../../dtos';
import { Feedback } from '../../../domain';
import { MediaServicePort } from '@/modules/media/public';
import { AppError } from '@/shared/errors/app-error';
import { randomUUID } from 'node:crypto';

@Injectable()
export class SubmitFeedbackCommand {
  constructor(
    private readonly feedback: FeedbackRepository,
    private readonly media?: MediaServicePort,
  ) {}

  async execute(reporterAccountId: string, input: SubmitFeedbackDTO, idempotencyKey?: string) {
    if (
      input.screenshotMediaId &&
      this.media &&
      !(await this.media.isAcceptedImage({ ownerId: reporterAccountId, mediaId: input.screenshotMediaId }))
    )
      throw new AppError('FEEDBACK_INVALID_MEDIA');
    const aggregate = Feedback.create({
      id: randomUUID(),
      reporterAccountId,
      category: input.category,
      description: input.description,
      contextUrl: input.contextUrl?.trim() || null,
      screenshotMediaId: input.screenshotMediaId || null,
    });
    const row = await this.feedback.create(aggregate, idempotencyKey?.trim() || undefined);

    return { accepted: true as const, ...row };
  }
}
