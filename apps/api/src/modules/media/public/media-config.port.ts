export const MEDIA_CONFIG = Symbol('MEDIA_CONFIG');

export type MediaConfig = {
  storage: {
    bucket: string;
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicBaseUrl: string;
    managedPrefixes: readonly string[];
  };
  upload: {
    grantTtlSeconds: number;
    allowedContentTypes: readonly string[];
    maxBytes: { avatar: number; content: number };
  };
};
