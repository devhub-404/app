import { DomainError } from '@/shared/errors/domain-error';
import { canonicalizeHttpUrl, InvalidHttpUrlError } from '@/shared/kernel/url/canonical-http-url';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export enum EventStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum EventFormat {
  Online = 'online',
  InPerson = 'in_person',
  Hybrid = 'hybrid',
}

export enum EventTemporalState {
  Upcoming = 'upcoming',
  Ongoing = 'ongoing',
  Ended = 'ended',
}

export interface EventProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverMediaId: string | null;
  url: string;
  startsAt: string;
  endsAt: string;
  format: EventFormat;
  location: string | null;
  status: EventStatus;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateEventProps = Omit<
  EventProps,
  'id' | 'status' | 'publishedAt' | 'deletedAt' | 'createdAt' | 'updatedAt'
>;

export class Event {
  private constructor(private readonly props: EventProps) {
    this.validateShape();
  }

  static create(id: string, input: CreateEventProps): Event {
    const now = new Date().toISOString();

    return new Event({
      ...input,
      url: Event.canonicalUrl(input.url),
      id,
      status: EventStatus.Draft,
      publishedAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: EventProps): Event {
    return new Event({ ...props });
  }

  get value(): EventProps {
    return { ...this.props };
  }

  temporalState(now = new Date()): EventTemporalState | null {
    if (this.props.status !== EventStatus.Published) return null;
    const start = new Date(this.props.startsAt).getTime();
    const end = new Date(this.props.endsAt).getTime();
    const current = now.getTime();
    if (start > current) return EventTemporalState.Upcoming;
    if (current < end) return EventTemporalState.Ongoing;

    return EventTemporalState.Ended;
  }

  update(
    input: Partial<
      Pick<EventProps, 'title' | 'description' | 'coverMediaId' | 'url' | 'startsAt' | 'endsAt' | 'format' | 'location'>
    >,
  ): void {
    this.ensureNotDeleted();
    Object.assign(this.props, input);
    if (input.url !== undefined) this.props.url = Event.canonicalUrl(input.url);
    this.validateShape();
    this.touch();
  }

  publish(now = new Date().toISOString()): void {
    this.ensureNotDeleted();
    if (this.props.status !== EventStatus.Draft) throw new DomainError('EVENT_INVALID_STATUS');
    if (new Date(this.props.endsAt).getTime() <= new Date(now).getTime()) throw new DomainError('EVENT_ALREADY_ENDED');
    this.props.status = EventStatus.Published;
    this.props.publishedAt = now;
    this.touch(now);
  }

  archive(now = new Date().toISOString()): void {
    this.ensureNotDeleted();
    if (this.props.status !== EventStatus.Published) throw new DomainError('EVENT_INVALID_STATUS');
    this.props.status = EventStatus.Archived;
    this.touch(now);
  }

  unarchive(now = new Date().toISOString()): void {
    this.ensureNotDeleted();
    if (this.props.status !== EventStatus.Archived) throw new DomainError('EVENT_INVALID_STATUS');
    this.props.status = EventStatus.Published;
    this.touch(now);
  }

  delete(now = new Date().toISOString()): void {
    if (this.props.deletedAt) return;
    this.props.deletedAt = now;
    this.touch(now);
  }

  private static canonicalUrl(value: string): string {
    try {
      return canonicalizeHttpUrl(value);
    } catch (error) {
      if (error instanceof InvalidHttpUrlError) throw new DomainError('EVENT_INVALID_URL');

      throw error;
    }
  }

  private ensureNotDeleted(): void {
    if (this.props.deletedAt) throw new DomainError('EVENT_DELETED');
  }

  private validateShape(): void {
    if (!this.props.title.trim() || !this.props.slug.trim() || !this.props.description.trim())
      throw new DomainError('EVENT_REQUIRED_FIELDS');
    if (
      this.props.title.length > FIELD_LIMITS.title ||
      this.props.slug.length > FIELD_LIMITS.slug ||
      this.props.description.length > FIELD_LIMITS.body
    )
      throw new DomainError('EVENT_INVALID_LENGTH');
    if (this.props.location && this.props.location.length > FIELD_LIMITS.location)
      throw new DomainError('EVENT_INVALID_LENGTH');
    if (new Date(this.props.startsAt).getTime() >= new Date(this.props.endsAt).getTime())
      throw new DomainError('EVENT_INVALID_DATES');
    if (this.props.format === EventFormat.Online && (!this.props.url || this.props.location))
      throw new DomainError('EVENT_INVALID_FORMAT_FIELDS');
    if (this.props.format === EventFormat.InPerson && !this.props.location)
      throw new DomainError('EVENT_INVALID_FORMAT_FIELDS');
    if (this.props.format === EventFormat.Hybrid && (!this.props.url || !this.props.location))
      throw new DomainError('EVENT_INVALID_FORMAT_FIELDS');
  }

  private touch(value = new Date().toISOString()): void {
    this.props.updatedAt = value;
  }
}
