import { resolveUniqueSlug } from '@/shared/kernel/slug/unique-slug';
import type { EventRepository } from './ports/event.repository';

export function resolveEventSlug(repository: EventRepository, title: string, context: unknown): Promise<string> {
  return resolveUniqueSlug(title, (candidate) => repository.slugExists(candidate, context), 200, 'event');
}
