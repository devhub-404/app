import { createRequire } from 'node:module';

type S3Sdk = typeof import('@aws-sdk/client-s3');
type S3Presigner = typeof import('@aws-sdk/s3-request-presigner');

const loadModule = createRequire(import.meta.url);

export function loadS3Sdk(): S3Sdk {
  return loadModule('@aws-sdk/client-s3') as S3Sdk;
}

export function loadS3Presigner(): S3Presigner {
  return loadModule('@aws-sdk/s3-request-presigner') as S3Presigner;
}
