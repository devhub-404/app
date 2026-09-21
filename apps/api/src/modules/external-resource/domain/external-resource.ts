import { DomainError } from '@/shared/errors/domain-error';
import { canonicalizeHttpUrl, InvalidHttpUrlError } from '@/shared/kernel/url/canonical-http-url';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export enum ExternalResourceStatus {
  Active = 'active',
  Archived = 'archived',
}

export interface ExternalResourceProps {
  id: string;
  title: string;
  description: string;
  url: string;
  status: ExternalResourceStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tagSlugs: string[];
}
export type CreateExternalResourceProps = Omit<
  ExternalResourceProps,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'tagSlugs'
> & {
  updatedAt?: string;
  status?: ExternalResourceStatus;
  createdAt?: string;
  deletedAt?: string | null;
  tagSlugs?: string[];
};
export type UpdateExternalResourceProps = Partial<Omit<ExternalResourceProps, 'id' | 'createdAt'>>;

export class ExternalResource {
  private constructor(private readonly props: ExternalResourceProps) {
    this.setTitle(props.title);
    this.setDescription(props.description);
    this.setUrl(props.url);
    this.setStatus(props.status);
    this.setTagSlugs(props.tagSlugs);
  }
  get id() {
    return this.props.id;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get url() {
    return this.props.url;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }
  get tagSlugs() {
    return [...this.props.tagSlugs];
  }
  static create(id: string, props: CreateExternalResourceProps): ExternalResource {
    const now = new Date().toISOString();
    const status = props.status ?? ExternalResourceStatus.Active;

    return ExternalResource.rehydrate({
      id,
      title: props.title,
      description: props.description,
      url: props.url,
      status,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
      tagSlugs: props.tagSlugs ?? [],
    });
  }
  static rehydrate(props: ExternalResourceProps) {
    return new ExternalResource(props);
  }
  update(props: UpdateExternalResourceProps): void {
    this.ensureNotDeleted();
    if (props.title !== undefined) this.setTitle(props.title);
    if (props.description !== undefined) this.setDescription(props.description);
    if (props.url !== undefined && props.url !== this.props.url) {
      this.setUrl(props.url);
    }
    if (props.tagSlugs !== undefined) this.setTagSlugs(props.tagSlugs);
    this.props.updatedAt = new Date().toISOString();
  }
  archive() {
    this.ensureNotDeleted();
    if (this.props.status !== ExternalResourceStatus.Active) throw new DomainError('EXTERNAL_RESOURCE_INVALID_STATUS');
    this.props.status = ExternalResourceStatus.Archived;
    this.props.updatedAt = new Date().toISOString();
  }
  unarchive() {
    this.ensureNotDeleted();
    if (this.props.status !== ExternalResourceStatus.Archived)
      throw new DomainError('EXTERNAL_RESOURCE_INVALID_STATUS');
    this.props.status = ExternalResourceStatus.Active;
    this.props.updatedAt = new Date().toISOString();
  }
  softDelete() {
    this.ensureNotDeleted();
    this.props.deletedAt = new Date().toISOString();
    this.props.updatedAt = this.props.deletedAt;
  }
  setStatus(status: ExternalResourceStatus) {
    if (!Object.values(ExternalResourceStatus).includes(status))
      throw new DomainError('EXTERNAL_RESOURCE_INVALID_STATUS');
    this.props.status = status;
  }
  private ensureNotDeleted() {
    if (this.props.deletedAt) throw new DomainError('EXTERNAL_RESOURCE_DELETED');
  }
  private setTitle(value: string) {
    if (!value || value.length > FIELD_LIMITS.title) throw new DomainError('EXTERNAL_RESOURCE_INVALID_TITLE');
    this.props.title = value;
  }
  private setDescription(value: string) {
    if (!value || value.length > FIELD_LIMITS.shortDescription)
      throw new DomainError('EXTERNAL_RESOURCE_INVALID_DESCRIPTION');
    this.props.description = value;
  }
  private setUrl(value: string) {
    try {
      this.props.url = canonicalizeHttpUrl(value);
    } catch (error) {
      if (error instanceof InvalidHttpUrlError) throw new DomainError('EXTERNAL_RESOURCE_INVALID_URL');

      throw error;
    }
  }
  private setTagSlugs(value: string[]) {
    this.props.tagSlugs = [...new Set(value)].filter(Boolean);
  }
}
