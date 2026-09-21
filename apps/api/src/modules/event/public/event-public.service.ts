import { Injectable } from '@nestjs/common';
import { EventRepository } from '../application/ports/event.repository';

export abstract class EventPublicServicePort {
  abstract resolveAccess(id: string): ReturnType<EventRepository['resolveAccess']>;
}

@Injectable()
export class EventPublicService implements EventPublicServicePort {
  constructor(private readonly repository: EventRepository) {}

  resolveAccess(id: string) {
    return this.repository.resolveAccess(id);
  }
}
