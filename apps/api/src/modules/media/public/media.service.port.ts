export type MediaUploadPurpose = 'avatar' | 'content';

export type CreateImageUploadInput = {
  ownerId: string;
  purpose: MediaUploadPurpose;
  contentType: string;
  sizeBytes: number;
  expiresInSeconds?: number;
};

export type CreatedImageUpload = {
  mediaId: string;
  uploadUrl: string;
  expiresInSeconds: number;
  expiresAt: string;
};

export type ConfirmImageUploadInput = {
  ownerId: string;
  purpose: MediaUploadPurpose;
  mediaId: string;
};

export type ConfirmedImageAsset = {
  mediaId: string;
  objectKey: string;
  url: string | null;
};

export type DeleteImageInput = {
  ownerId: string;
  mediaId: string;
};

export type ImportOAuthAvatarInput = {
  ownerId: string;
  purpose: 'avatar';
  source: 'oauth';
  provider: 'google' | 'github';
  sourceUrl: string;
};

export abstract class MediaServicePort {
  abstract isAcceptedImage(input: { ownerId: string; mediaId: string }): Promise<boolean>;
  abstract createImageUpload(input: CreateImageUploadInput): Promise<CreatedImageUpload>;
  abstract confirmImageUpload(input: ConfirmImageUploadInput): Promise<ConfirmedImageAsset | null>;
  abstract deleteImage(input: DeleteImageInput): Promise<boolean>;
  abstract importOAuthAvatar(input: ImportOAuthAvatarInput): Promise<ConfirmedImageAsset | null>;
}

export const MEDIA_SERVICE = 'MEDIA_SERVICE';
