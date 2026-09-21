import type { EventDTO, ListEventsDTO, PaginatedEventsDTO } from '../dtos';
import type { Event } from '../../domain/event';

export abstract class EventRepository {
  abstract transaction<T>(work: (context: unknown) => Promise<T>): Promise<T>;
  abstract findAggregateById(id: string): Promise<Event | null>;
  abstract saveAggregate(event: Event): Promise<boolean>;
  abstract saveNewAggregate(event: Event, context: unknown): Promise<EventDTO>;
  abstract eventExistsByUrl(url: string, context: unknown): Promise<boolean>;
  abstract slugExists(slug: string, context?: unknown): Promise<boolean>;
  abstract list(query: ListEventsDTO, management?: boolean): Promise<PaginatedEventsDTO>;
  abstract listMine(accountId: string, query: ListEventsDTO): Promise<PaginatedEventsDTO>;
  abstract getBySlug(slug: string): Promise<EventDTO>;
  abstract resolveAccess(id: string): Promise<{ id: string; isPublic: boolean } | null>;
  abstract getForManagement(id: string): Promise<EventDTO>;
}
