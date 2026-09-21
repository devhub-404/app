import { MediaApi } from './media.api.ts';
import { convertImageToWebp } from './image-to-webp';
import type { MediaUploadPurpose } from './media.dto';

export async function uploadImage(file: File, purpose: MediaUploadPurpose) {
  let webp: File;
  try {
    webp = await convertImageToWebp(file);
  } catch {
    return { error: { code: 'UPLOAD_CONVERSION_FAILED' } };
  }

  const grant = await MediaApi.requestUpload({ purpose, contentType: 'image/webp', sizeBytes: webp.size });
  const upload = grant.data?.data;
  if (grant.error || !upload) return { error: grant.error, response: grant.response };

  try {
    const response = await MediaApi.uploadToSignedUrl(upload.uploadUrl, webp);
    if (!response.ok) return { error: { code: 'UPLOAD_FAILED' } };
  } catch {
    return { error: { code: 'UPLOAD_FAILED' } };
  }

  return MediaApi.confirmUpload({ purpose, mediaId: upload.mediaId });
}
