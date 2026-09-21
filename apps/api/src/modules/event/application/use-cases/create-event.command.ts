import { Injectable } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
import type { CreateEventDTO } from '../dtos';
import { EventCreationService } from '../services/event-creation.service';

@Injectable()
export class CreateEventCommand {
  constructor(
    private readonly repository: EventRepository,
    private readonly creation: EventCreationService,
  ) {}

  execute(input: CreateEventDTO) {
    return this.repository.transaction((context) => this.creation.create(input, context));
  }
}
