import { DomainError } from '@/shared/errors/domain-error';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export enum ArticleStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ArticleProps {
  id: string;
  authorId: string;
  title: string;
  description: string;
  slug: string;
  coverImageUrl: string | null;
  coverMediaId: string | null;
  content: string;
  contentVersion: number;
  readingTimeMinutes: number;
  commentsEnabled: boolean;
  status: ArticleStatus;
  publishedAt: string | null;
  hiddenAt: string | null;
  hideReason: string | null;
  updatedAt: string;
  deletedAt: string | null;
  tagSlugs: string[];
}

export type CreateArticleProps = Pick<ArticleProps, 'title' | 'description' | 'authorId' | 'slug' | 'content'> & {
  coverImageUrl?: string | null;
  coverMediaId?: string | null;
  tagSlugs?: string[];
  contentVersion?: number;
  publish?: boolean;
  publishedAt?: string;
};

export type UpdateArticleProps = {
  title?: string;
  description?: string;
  coverImageUrl?: string | null;
  coverMediaId?: string | null;
  content?: string;
  tagSlugs?: string[];
};

export class Article {
  private constructor(
    private readonly _id: string,
    private readonly _authorId: string,
    private _title: string,
    private _description: string,
    private _slug: string,
    private _coverImageUrl: string | null,
    private _coverMediaId: string | null,
    private _content: string,
    private _contentVersion: number,
    private _readingTimeMinutes: number,
    private _commentsEnabled: boolean,
    private _status: ArticleStatus,
    private _publishedAt: string | null,
    private _hiddenAt: string | null,
    private _hideReason: string | null,
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
    this.setReadingTimeMinutes(_readingTimeMinutes);
    this.setTagSlugs(_tagSlugs);
    this.setStatus(_status);
    this.setPublishedAt(_publishedAt);
    this.setHiddenAt(_hiddenAt);
    this.setHideReason(_hideReason);
    this.setUpdatedAt(_updatedAt);
  }

  get id(): string {
    return this._id;
  }

  get authorId(): string {
    return this._authorId;
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

  get readingTimeMinutes(): number {
    return this._readingTimeMinutes;
  }

  get commentsEnabled(): boolean {
    return this._commentsEnabled;
  }

  get status(): ArticleStatus {
    return this._status;
  }

  get publishedAt(): string | null {
    return this._publishedAt;
  }

  get updatedAt(): string {
    return this._updatedAt;
  }

  get hiddenAt(): string | null {
    return this._hiddenAt;
  }

  get hideReason(): string | null {
    return this._hideReason;
  }

  get deletedAt(): string | null {
    return this._deletedAt;
  }

  get tagSlugs(): string[] {
    return [...this._tagSlugs];
  }

  static create(id: string, props: CreateArticleProps): Article {
    const now = new Date().toISOString();
    const status = props.publish ? ArticleStatus.Published : ArticleStatus.Draft;
    const publishedAt = props.publish ? (props.publishedAt ?? now) : null;

    return new Article(
      id,
      props.authorId ?? null,
      props.title,
      props.description,
      props.slug,
      props.coverImageUrl ?? null,
      props.coverMediaId ?? null,
      props.content,
      props.contentVersion ?? 1,
      Article.deriveReadingTimeMinutes(props.content),
      true,
      status,
      publishedAt,
      null,
      null,
      now,
      null,
      props.tagSlugs ?? [],
    );
  }

  static rehydrate(props: ArticleProps): Article {
    return new Article(
      props.id,
      props.authorId,
      props.title,
      props.description,
      props.slug,
      props.coverImageUrl,
      props.coverMediaId,
      props.content,
      props.contentVersion,
      props.readingTimeMinutes,
      props.commentsEnabled,
      props.status,
      props.publishedAt,
      props.hiddenAt,
      props.hideReason,
      props.updatedAt,
      props.deletedAt,
      props.tagSlugs,
    );
  }

  update(props: UpdateArticleProps): void {
    this.ensureNotDeleted();

    if (props.title !== undefined && props.title !== this._title) {
      this.setTitle(props.title);
    }
    if (props.description !== undefined && props.description !== this._description) {
      this.setDescription(props.description);
    }
    if (props.coverImageUrl !== undefined && props.coverImageUrl !== this._coverImageUrl) {
      this.setCoverImageUrl(props.coverImageUrl);
    }
    if (props.coverMediaId !== undefined && props.coverMediaId !== this._coverMediaId) {
      this.setCoverMediaId(props.coverMediaId);
    }
    if (props.content !== undefined && props.content !== this._content) {
      this.setContent(props.content);
      this.setReadingTimeMinutes(Article.deriveReadingTimeMinutes(this._content));
    }
    if (props.tagSlugs !== undefined) {
      this.setTagSlugs(props.tagSlugs);
    }
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
    this.setReadingTimeMinutes(Article.deriveReadingTimeMinutes(content));
    this._contentVersion += 1;
    this.touch();
  }

  publish(publishedAt?: string): void {
    this.ensureNotDeleted();
    if (this._status !== ArticleStatus.Draft && this._status !== ArticleStatus.Archived) {
      throw new DomainError('ARTICLE_INVALID_STATUS');
    }

    this._status = ArticleStatus.Published;
    this._publishedAt = this._publishedAt ?? publishedAt ?? new Date().toISOString();
    this.touch();
  }

  archive(): void {
    this.ensureNotDeleted();
    if (this._status !== ArticleStatus.Published) {
      throw new DomainError('ARTICLE_INVALID_STATUS');
    }

    this._status = ArticleStatus.Archived;
    this.touch();
  }

  unarchive(): void {
    this.ensureNotDeleted();
    if (this._status !== ArticleStatus.Archived) {
      throw new DomainError('ARTICLE_INVALID_STATUS');
    }

    this._status = ArticleStatus.Published;
    this.touch();
  }

  hide(reason: string): void {
    this.ensureNotDeleted();
    if (this._status !== ArticleStatus.Published || this._hiddenAt || reason.trim().length === 0) {
      throw new DomainError('ARTICLE_INVALID_STATUS');
    }

    this._hiddenAt = new Date().toISOString();
    this._hideReason = reason.trim();
    this.touch();
  }

  unhide(): void {
    this.ensureNotDeleted();
    if (!this._hiddenAt) throw new DomainError('ARTICLE_INVALID_STATUS');
    this._hiddenAt = null;
    this._hideReason = null;
    this.touch();
  }

  softDelete(): void {
    if (this._deletedAt) return;

    this._deletedAt = new Date().toISOString();
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date().toISOString();
  }

  private ensureNotDeleted(): void {
    if (this._deletedAt) {
      throw new DomainError('ARTICLE_IS_DELETED');
    }
  }

  private setTitle(title: string): void {
    if (title.length === 0 || title.length > FIELD_LIMITS.title) {
      throw new DomainError('ARTICLE_INVALID_TITLE');
    }
    this._title = title;
  }

  private setDescription(description: string): void {
    const normalized = description.trim();
    if (normalized.length === 0 || normalized.length > FIELD_LIMITS.shortDescription) {
      throw new DomainError('ARTICLE_INVALID_DESCRIPTION');
    }
    this._description = normalized;
  }

  private setSlug(slug: string): void {
    if (slug.length === 0 || slug.length > FIELD_LIMITS.slug || !SLUG_PATTERN.test(slug)) {
      throw new DomainError('ARTICLE_INVALID_SLUG');
    }
    this._slug = slug;
  }

  private setCoverImageUrl(url: string | null): void {
    if (url === null) {
      this._coverImageUrl = null;

      return;
    }
    if (url.length > 512) {
      throw new DomainError('ARTICLE_INVALID_COVER_IMAGE_URL');
    }
    this._coverImageUrl = url;
  }

  private setCoverMediaId(coverMediaId: string | null | undefined): void {
    this._coverMediaId = coverMediaId ?? null;
  }

  private setContent(content: string): void {
    if (content.length === 0 || content.length > FIELD_LIMITS.body) {
      throw new DomainError('ARTICLE_INVALID_CONTENT');
    }
    this._content = content;
  }

  private setReadingTimeMinutes(readingTime: number): void {
    if (!Number.isInteger(readingTime) || readingTime <= 0 || readingTime > 500) {
      throw new DomainError('ARTICLE_INVALID_READING_TIME');
    }
    this._readingTimeMinutes = readingTime;
  }

  static deriveReadingTimeMinutes(markdown: string): number {
    const words = markdown.trim().split(/\s+/).filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
  }

  private setStatus(status: ArticleStatus): void {
    if (!Object.values(ArticleStatus).includes(status)) {
      throw new DomainError('ARTICLE_INVALID_STATUS');
    }
    this._status = status;
  }

  private setPublishedAt(publishedAt: string | null): void {
    if (publishedAt === null) {
      this._publishedAt = null;

      return;
    }
    if (publishedAt.length === 0) {
      throw new DomainError('ARTICLE_INVALID_PUBLISHED_AT');
    }
    this._publishedAt = publishedAt;
  }

  private setHiddenAt(hiddenAt: string | null): void {
    this._hiddenAt = hiddenAt;
  }

  private setHideReason(hideReason: string | null): void {
    this._hideReason = hideReason;
  }

  private setUpdatedAt(updatedAt: string): void {
    if (updatedAt.length === 0) {
      throw new DomainError('ARTICLE_INVALID_UPDATED_AT');
    }
    this._updatedAt = updatedAt;
  }

  private setTagSlugs(tagSlugs: string[]): void {
    this._tagSlugs = Array.from(new Set(tagSlugs.filter(Boolean)));
  }
}
