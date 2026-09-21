import { Injectable } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
@Injectable()
export class GetEventByIdQuery {
  constructor(private readonly repository: EventRepository) {}
  execute(id: string) {
    return this.repository.getForManagement(id);
  }
}
