export type ObjectStorageObjectMetadata = {
  contentType: string | null;
  sizeBytes: number | null;
};

export type ObjectStorageObject = {
  key: string;
  lastModified: Date | null;
};

export abstract class ObjectStorageAssetService {
  abstract putObject(
    bucket: string,
    key: string,
    body: Uint8Array,
    metadata: { contentType: string; contentLength: number },
  ): Promise<void>;
  abstract getObjectMetadata(bucket: string, key: string): Promise<ObjectStorageObjectMetadata | null>;
  abstract listObjects(bucket: string, prefix: string): Promise<ObjectStorageObject[]>;
  abstract deleteObject(bucket: string, key: string): Promise<void>;
}
