import { DomainError } from '@/shared/errors/domain-error';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export enum NewsStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export interface NewsProps {
  id: string;
  title: string;
  description: string;
  slug: string;
  coverImageUrl: string | null;
  coverMediaId: string | null;
  content: string;
  contentVersion: number;
  commentsEnabled: boolean;
  status: NewsStatus;
  occurredAt?: string | null;
  publishedAt: string | null;
  updatedAt: string;
  deletedAt: string | null;
  tagSlugs: string[];
}

export type CreateNewsProps = Pick<NewsProps, 'title' | 'description' | 'slug' | 'content'> & {
  occurredAt?: string | null;
  coverImageUrl?: string | null;
  coverMediaId?: string | null;
  tagSlugs?: string[];
  contentVersion?: number;
};

export type UpdateNewsProps = {
  title?: string;
  description?: string;
  coverImageUrl?: string | null;
  coverMediaId?: string | null;
  content?: string;
  tagSlugs?: string[];
  occurredAt?: string | null;
};

export class News {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _description: string,
    private _slug: string,
    private _coverImageUrl: string | null,
    private _coverMediaId: string | null,
    private _content: string,
    private _contentVersion: number,
    private _commentsEnabled: boolean,
    private _status: NewsStatus,
    private _occurredAt: string | null,
    private _publishedAt: string | null,
    private _updatedAt: string,
    private _deletedAt: string | null,
    private _tagSlugs: string[],
  ) {
    this.setTitle(_title);
    this.setDescription(_description);
    this.setSlug(_slug);
    this.setCoverImageUrl(_coverImageUrl);
    this.setCoverMediaId(_coverMediaId);
    this.setContent(_content);
    this.setStatus(_status);
    this.setTagSlugs(_tagSlugs);
    this.setPublishedAt(_publishedAt);
    this.setOccurredAt(_occurredAt);
    this.setUpdatedAt(_updatedAt);
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }
  get description(): string {
    return this._description;
  }

  get slug(): string {
    return this._slug;
  }

  get coverImageUrl(): string | null {
    return this._coverImageUrl;
  }

  get coverMediaId(): string | null {
    return this._coverMediaId;
  }

  get content(): string {
    return this._content;
  }

  get contentVersion(): number {
    return this._contentVersion;
  }

  get commentsEnabled(): boolean {
    return this._commentsEnabled;
  }

  get status(): NewsStatus {
    return this._status;
  }

  get publishedAt(): string | null {
    return this._publishedAt;
  }
  get occurredAt(): string | null {
    return this._occurredAt;
  }

  get updatedAt(): string {
    return this._updatedAt;
  }

  get deletedAt(): string | null {
    return this._deletedAt;
  }

  get tagSlugs(): string[] {
    return [...this._tagSlugs];
  }

  static create(id: string, props: CreateNewsProps): News {
    const now = new Date().toISOString();

    return new News(
      id,
      props.title,
      props.description,
      props.slug,
      props.coverImageUrl ?? null,
      props.coverMediaId ?? null,
      props.content,
      props.contentVersion ?? 1,
      true,
      NewsStatus.Draft,
      props.occurredAt ?? null,
      null,
      now,
      null,
      props.tagSlugs ?? [],
    );
  }

  static rehydrate(props: NewsProps): News {
    return new News(
      props.id,
      props.title,
      props.description,
      props.slug,
      props.coverImageUrl,
      props.coverMediaId,
      props.content,
      props.contentVersion,
      props.commentsEnabled,
      props.status,
      props.occurredAt ?? null,
      props.publishedAt,
      props.updatedAt,
      props.deletedAt,
      props.tagSlugs ?? [],
    );
  }

  update(props: UpdateNewsProps): void {
    this.ensureNotDeleted();

    if (props.title !== undefined && props.title !== this._title) {
      this.setTitle(props.title);
    }
    if (props.description !== undefined && props.description !== this._description)
      this.setDescription(props.description);
    if (props.coverImageUrl !== undefined && props.coverImageUrl !== this._coverImageUrl) {
      this.setCoverImageUrl(props.coverImageUrl);
    }
    if (props.coverMediaId !== undefined && props.coverMediaId !== this._coverMediaId) {
      this.setCoverMediaId(props.coverMediaId);
    }
    if (props.content !== undefined && props.content !== this._content) {
      this.setContent(props.content);
    }
    if (props.tagSlugs !== undefined) {
      this.setTagSlugs(props.tagSlugs);
    }
    if (props.occurredAt !== undefined) this.setOccurredAt(props.occurredAt);

    this.touch();
  }

  setCommentsEnabled(enabled: boolean): void {
    this.ensureNotDeleted();
    this._commentsEnabled = enabled;
    this.touch();
  }

  applyContent(content: string): void {
    this.ensureNotDeleted();
    this.setContent(content);
    this._contentVersion += 1;
    this.touch();
  }

  publish(publishedAt?: string): void {
    this.ensureNotDeleted();
    if (this._status !== NewsStatus.Draft) {
      throw new DomainError('NEWS_INVALID_STATUS');
    }
    if (!this._occurredAt) throw new DomainError('NEWS_OCCURRED_AT_REQUIRED');

    this._status = NewsStatus.Published;
    this._publishedAt = publishedAt ?? this._publishedAt ?? new Date().toISOString();
    this.touch();
  }

  archive(): void {
    this.ensureNotDeleted();
    if (this._status !== NewsStatus.Published) {
      throw new DomainError('NEWS_INVALID_STATUS');
    }

    this._status = NewsStatus.Archived;
    this.touch();
  }

  unarchive(): void {
    this.ensureNotDeleted();
    if (this._status !== NewsStatus.Archived) {
      throw new DomainError('NEWS_INVALID_STATUS');
    }

    this._status = NewsStatus.Published;
    this.touch();
  }

  softDelete(): void {
    if (this._deletedAt) return;

    this._deletedAt = new Date().toISOString();
    if (this._status === NewsStatus.Published) this._status = NewsStatus.Archived;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date().toISOString();
  }

  private ensureNotDeleted(): void {
    if (this._deletedAt) {
      throw new DomainError('NEWS_IS_DELETED');
    }
  }

  private setTitle(title: string): void {
    if (title.length === 0 || title.length > FIELD_LIMITS.title) {
      throw new DomainError('NEWS_INVALID_TITLE');
    }
    this._title = title;
  }

  private setDescription(description: string): void {
    const normalized = description.trim();
    if (normalized.length === 0 || normalized.length > FIELD_LIMITS.shortDescription)
      throw new DomainError('NEWS_INVALID_DESCRIPTION');
    this._description = normalized;
  }

  private setSlug(slug: string): void {
    if (slug.length === 0 || slug.length > FIELD_LIMITS.slug || !SLUG_PATTERN.test(slug)) {
      throw new DomainError('NEWS_INVALID_SLUG');
    }
    this._slug = slug;
  }

  private setCoverImageUrl(url: string | null): void {
    if (url === null) {
      this._coverImageUrl = null;

      return;
    }
    if (url.length > 512) {
      throw new DomainError('NEWS_INVALID_COVER_IMAGE_URL');
    }
    this._coverImageUrl = url;
  }

  private setCoverMediaId(coverMediaId: string | null | undefined): void {
    this._coverMediaId = coverMediaId ?? null;
  }

  private setContent(content: string): void {
    if (content.length === 0 || content.length > FIELD_LIMITS.body) {
      throw new DomainError('NEWS_INVALID_CONTENT');
    }
    this._content = content;
  }

  private setPublishedAt(publishedAt: string | null): void {
    if (publishedAt === null) {
      this._publishedAt = null;

      return;
    }
    if (publishedAt.length === 0) {
      throw new DomainError('NEWS_INVALID_PUBLISHED_AT');
    }
    this._publishedAt = publishedAt;
  }

  private setOccurredAt(occurredAt: string | null): void {
    if (occurredAt !== null && occurredAt.length === 0) throw new DomainError('NEWS_INVALID_OCCURRED_AT');
    this._occurredAt = occurredAt;
  }

  private setUpdatedAt(updatedAt: string): void {
    if (updatedAt.length === 0) {
      throw new DomainError('NEWS_INVALID_UPDATED_AT');
    }
    this._updatedAt = updatedAt;
  }

  private setTagSlugs(tagSlugs: string[]): void {
    this._tagSlugs = Array.from(new Set(tagSlugs.filter((slug) => slug.length > 0)));
  }

  private setStatus(status: NewsStatus): void {
    if (!Object.values(NewsStatus).includes(status)) {
      throw new DomainError('NEWS_INVALID_STATUS');
    }
    this._status = status;
  }
}
