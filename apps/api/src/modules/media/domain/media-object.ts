import { DomainError } from '@/shared/errors/domain-error';

export type MediaObjectPurpose = 'avatar' | 'content';
export type MediaObjectStatus = 'pending' | 'confirmed' | 'deleted';

export type MediaObjectState = {
  id: string;
  ownerAccountId: string;
  purpose: MediaObjectPurpose;
  objectKey: string;
  contentType: string;
  size: number;
  status: MediaObjectStatus;
  confirmedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export class MediaObject {
  private constructor(private readonly state: MediaObjectState) {}

  static create(
    id: string,
    input: Omit<MediaObjectState, 'id' | 'status' | 'confirmedAt' | 'deletedAt' | 'createdAt' | 'updatedAt'>,
    at = new Date(),
  ): MediaObject {
    const now = at.toISOString();

    return new MediaObject({
      ...input,
      id,
      status: 'pending',
      confirmedAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(state: MediaObjectState): MediaObject {
    return new MediaObject({ ...state });
  }

  get value(): MediaObjectState {
    return { ...this.state };
  }

  confirm(at = new Date()): void {
    if (this.state.status === 'deleted') throw new DomainError('MEDIA_OBJECT_DELETED');
    if (this.state.status === 'confirmed') return;

    this.state.status = 'confirmed';
    this.state.confirmedAt = at.toISOString();
    this.touch(at);
  }

  delete(at = new Date()): void {
    if (this.state.status === 'deleted') return;

    this.state.status = 'deleted';
    this.state.deletedAt = at.toISOString();
    this.touch(at);
  }

  private touch(at: Date): void {
    this.state.updatedAt = at.toISOString();
  }
}
