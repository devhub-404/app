import { DomainError } from '@/shared/errors/domain-error';
export interface TagProps {
  id: string;
  name: string;
  slug: string;
  status: TagStatus;
  createdAt: string;
  updatedAt: string;
}

export const TAG_STATUS_VALUES = ['active', 'archived'] as const;
export type TagStatus = (typeof TAG_STATUS_VALUES)[number];
export type CreateTagProps = Omit<TagProps, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: TagStatus };
export type UpdateTagProps = Partial<Omit<TagProps, 'id' | 'createdAt' | 'updatedAt'>>;

export class Tag {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _slug: string,
    private _status: TagStatus,
    private _createdAt: string,
    private _updatedAt: string,
  ) {
    this.setName(_name);
    this.setSlug(_slug);
    if (!TAG_STATUS_VALUES.includes(_status)) throw new DomainError('TAG_INVALID_STATUS');
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get createdAt(): string {
    return this._createdAt;
  }
  get status(): TagStatus {
    return this._status;
  }
  get updatedAt(): string {
    return this._updatedAt;
  }

  static create(id: string, props: CreateTagProps) {
    const now = new Date().toISOString();

    return new Tag(id, props.name, props.slug, props.status ?? 'active', now, now);
  }

  static rehydrate(props: TagProps) {
    return new Tag(props.id, props.name, props.slug, props.status, props.createdAt, props.updatedAt);
  }

  update(props: UpdateTagProps): void {
    if (props.name !== undefined && props.name !== this._name) {
      this.setName(props.name);
    }
    if (props.status !== undefined) {
      if (!TAG_STATUS_VALUES.includes(props.status)) throw new DomainError('TAG_INVALID_STATUS');
      this._status = props.status;
    }
    if (props.slug !== undefined && props.slug !== this._slug) this.setSlug(props.slug);
    this._updatedAt = new Date().toISOString();
  }

  archive(): void {
    if (this._status !== 'active') throw new DomainError('TAG_INVALID_STATUS');
    this._status = 'archived';
  }

  unarchive(): void {
    if (this._status !== 'archived') throw new DomainError('TAG_INVALID_STATUS');
    this._status = 'active';
  }

  static defaultNameFromSlug(slug: string): string {
    return slug
      .split('-')
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  static normalizeSlug(value: string): string {
    return value
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  public setName(name: string): void {
    if (name.length === 0 || name.length > 32) {
      throw new DomainError('TAG_INVALID_NAME');
    }
    this._name = name;
  }

  public setSlug(slug: string): void {
    if (slug.length === 0 || slug.length > 32 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new DomainError('TAG_INVALID_SLUG');
    }
    this._slug = slug;
  }
}
