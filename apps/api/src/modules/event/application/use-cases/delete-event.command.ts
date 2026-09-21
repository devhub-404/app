import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { DomainError } from '@/shared/errors/domain-error';
import { EventRepository } from '../ports/event.repository';
@Injectable()
export class DeleteEventCommand {
  constructor(private readonly repository: EventRepository) {}
  async execute(id: string) {
    const event = await this.repository.findAggregateById(id);
    if (!event) throw new AppError('CONTENT_NOT_FOUND');
    try {
      event.delete();
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw error;
    }
    if (!(await this.repository.saveAggregate(event))) throw new AppError('CONTENT_NOT_FOUND');
  }
}
