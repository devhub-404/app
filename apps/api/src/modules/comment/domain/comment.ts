import { DomainError } from '@/shared/errors/domain-error';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export interface CommentProps {
  id: string;
  resourceId: string;
  authorAccountId: string | null;
  parentId: string | null;
  content: string | null;
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  hiddenAt?: string | null;
  deletedAt?: string | null;
}

export type CreateCommentProps = {
  resourceId: string;
  authorAccountId: string;
  parentId?: string | null;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateCommentProps = { content?: string };

/**
 * Comment is a transversal capability anchored by ResourceIdentity.
 * Target-kind eligibility is a domain rule expressed by CommentTargetPolicy.
 */
export class Comment {
  private constructor(
    private readonly _id: string,
    private readonly _resourceId: string,
    private _authorAccountId: string | null,
    private readonly _parentId: string | null,
    private _content: string | null,
    private _editedAt: string | null,
    private readonly _createdAt: string,
    private _updatedAt: string,
    private _hiddenAt: string | null,
    private _deletedAt: string | null,
  ) {
    if (_deletedAt) {
      if (_authorAccountId !== null || _content !== null) throw new DomainError('CONTENT_COMMENT_INVALID_CONTENT');
    } else {
      if (_content === null) throw new DomainError('CONTENT_COMMENT_INVALID_CONTENT');
      this.assertContent(_content);
    }
    this.setUpdatedAt(_updatedAt);
  }

  get id(): string {
    return this._id;
  }
  get resourceId(): string {
    return this._resourceId;
  }
  get authorAccountId(): string | null {
    return this._authorAccountId;
  }
  get parentId(): string | null {
    return this._parentId;
  }
  get content(): string | null {
    return this._content;
  }
  get createdAt(): string {
    return this._createdAt;
  }
  get editedAt(): string | null {
    return this._editedAt;
  }
  get updatedAt(): string {
    return this._updatedAt;
  }
  get hiddenAt(): string | null {
    return this._hiddenAt;
  }
  get deletedAt(): string | null {
    return this._deletedAt;
  }
  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  static create(id: string, props: CreateCommentProps): Comment {
    const now = new Date().toISOString();

    return new Comment(
      id,
      props.resourceId,
      props.authorAccountId,
      props.parentId ?? null,
      props.content,
      null,
      props.createdAt ?? now,
      props.updatedAt ?? now,
      null,
      null,
    );
  }

  static rehydrate(props: CommentProps): Comment {
    return new Comment(
      props.id,
      props.resourceId,
      props.authorAccountId,
      props.parentId,
      props.content,
      props.editedAt ?? null,
      props.createdAt,
      props.updatedAt,
      props.hiddenAt ?? null,
      props.deletedAt ?? null,
    );
  }

  update(props: UpdateCommentProps): void {
    if (this.isDeleted) throw new DomainError('CONTENT_COMMENT_NOT_FOUND');
    if (props.content !== undefined && props.content !== this._content) {
      this.assertContent(props.content);
      this._content = props.content;
      this._editedAt = new Date().toISOString();
      this.touch();
    }
  }

  delete(): void {
    if (this.isDeleted) return;
    this._authorAccountId = null;
    this._content = null;
    this._editedAt = null;
    this._deletedAt = new Date().toISOString();
    this.touch();
  }

  hide(): void {
    if (this.isDeleted) throw new DomainError('CONTENT_COMMENT_NOT_FOUND');
    if (this._hiddenAt) throw new DomainError('CONTENT_COMMENT_ALREADY_HIDDEN');
    this._hiddenAt = new Date().toISOString();
    this.touch();
  }

  unhide(): void {
    if (this.isDeleted) throw new DomainError('CONTENT_COMMENT_NOT_FOUND');
    if (!this._hiddenAt) throw new DomainError('CONTENT_COMMENT_ALREADY_VISIBLE');
    this._hiddenAt = null;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date().toISOString();
  }
  private assertContent(content: string): void {
    if (content.length === 0 || content.length > FIELD_LIMITS.comment)
      throw new DomainError('CONTENT_COMMENT_INVALID_CONTENT');
  }
  private setUpdatedAt(updatedAt: string): void {
    if (updatedAt.length === 0) throw new DomainError('CONTENT_COMMENT_INVALID_UPDATED_AT');
    this._updatedAt = updatedAt;
  }
}
