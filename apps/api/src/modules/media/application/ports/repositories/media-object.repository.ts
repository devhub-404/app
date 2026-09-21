import type { MediaObjectState } from '@/modules/media/domain/media-object';
import type { MediaUploadPurpose } from '@/modules/media/public/media.service.port';

export type MediaObjectRecord = MediaObjectState;

export type CreateMediaObjectInput = {
  ownerAccountId: string;
  purpose: MediaUploadPurpose;
  objectKey: string;
  contentType: string;
  size: number;
};

export abstract class MediaObjectRepository {
  abstract create(input: CreateMediaObjectInput): Promise<MediaObjectRecord>;
  abstract findOwnedById(ownerAccountId: string, id: string): Promise<MediaObjectRecord | null>;
  abstract findById(id: string): Promise<MediaObjectRecord | null>;
  abstract confirm(id: string): Promise<MediaObjectRecord>;
  abstract markDeleted(id: string): Promise<void>;
  abstract findPendingCreatedBefore(cutoff: string): Promise<MediaObjectRecord[]>;
  abstract findConfirmedObjectKeys(): Promise<string[]>;
}
