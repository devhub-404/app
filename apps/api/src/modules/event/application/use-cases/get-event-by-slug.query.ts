import { Injectable } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
@Injectable()
export class GetEventBySlugQuery {
  constructor(private readonly repository: EventRepository) {}
  execute(slug: string) {
    return this.repository.getBySlug(slug);
  }
}
