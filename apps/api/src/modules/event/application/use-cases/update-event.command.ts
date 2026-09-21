import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { DomainError } from '@/shared/errors/domain-error';
import { EventFormat } from '../../domain/event';
import { EventRepository } from '../ports/event.repository';
import type { UpdateEventDTO } from '../dtos';

@Injectable()
export class UpdateEventCommand {
  constructor(private readonly repository: EventRepository) {}

  async execute(id: string, input: UpdateEventDTO) {
    const event = await this.repository.findAggregateById(id);
    if (!event) throw new AppError('CONTENT_NOT_FOUND');
    try {
      event.update({ ...input, format: input.format as EventFormat });
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw error;
    }
    if (!(await this.repository.saveAggregate(event))) throw new AppError('CONTENT_NOT_FOUND');

    return this.repository.getForManagement(id);
  }
}
