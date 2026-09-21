import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { DomainError } from '@/shared/errors/domain-error';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import { Event, EventFormat } from '../../domain/event';
import { EventRepository } from '../ports/event.repository';
import type { CreateEventDTO, EventDTO } from '../dtos';
import { resolveEventSlug } from '../event-workflow';

@Injectable()
export class EventCreationService {
  constructor(
    private readonly repository: EventRepository,
    private readonly resources: ResourceIdentityPort,
  ) {}

  async create(input: CreateEventDTO, context: unknown): Promise<EventDTO> {
    const slug = await resolveEventSlug(this.repository, input.title, context);
    const identity = await this.resources.create('event', context);
    try {
      const event = Event.create(identity.id, {
        ...input,
        slug,
        coverMediaId: input.coverMediaId ?? null,
        location: input.location ?? null,
        format: input.format as EventFormat,
      });
      if (await this.repository.eventExistsByUrl(event.value.url, context)) throw new AppError('EVENT_ALREADY_EXISTS');

      return await this.repository.saveNewAggregate(event, context);
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

      throw error;
    }
  }
}
