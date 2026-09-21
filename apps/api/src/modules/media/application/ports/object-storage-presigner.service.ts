export type PresignedPutObjectRequest = {
  bucket: string;
  key: string;
  contentType: string;
  contentLength: number;
  expiresInSeconds: number;
};

export type PresignedPutObjectResponse = {
  bucket: string;
  key: string;
  url: string;
  expiresInSeconds: number;
  expiresAt: string;
};

export abstract class ObjectStoragePresignerService {
  abstract createPutObjectUrl(request: PresignedPutObjectRequest): Promise<PresignedPutObjectResponse>;
}
