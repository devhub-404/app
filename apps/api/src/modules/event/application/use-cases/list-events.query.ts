import { Injectable } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
import type { ListEventsDTO } from '../dtos';
@Injectable()
export class ListEventsQuery {
  constructor(private readonly repository: EventRepository) {}
  execute(query: ListEventsDTO) {
    return this.repository.list(query, false);
  }
}
