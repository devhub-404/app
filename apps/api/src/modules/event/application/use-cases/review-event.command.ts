import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { DomainError } from '@/shared/errors/domain-error';
import { EventRepository } from '../ports/event.repository';
import type { ReviewEventDTO } from '../dtos';

@Injectable()
export class ReviewEventCommand {
  constructor(private readonly repository: EventRepository) {}
  async execute(id: string, input: ReviewEventDTO) {
    const event = await this.repository.findAggregateById(id);
    if (!event) throw new AppError('CONTENT_NOT_FOUND');
    try {
      if (input.status === 'published') event.publish();
      else event.archive();
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw error;
    }
    await this.repository.saveAggregate(event);

    return this.repository.getForManagement(id);
  }
}
