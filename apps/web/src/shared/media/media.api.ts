import type { ConfirmedMediaUpload, ConfirmMediaUploadInput, RequestMediaUploadInput, UploadGrant } from './media.dto';
import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';

export class MediaApi {
  static async requestUpload(input: RequestMediaUploadInput): Promise<ApiResult<UploadGrant>> {
    const result = await privateClient.POST('/api/v1/media/uploads', {
      body: input,
    });
    return result;
  }

  static async confirmUpload(input: ConfirmMediaUploadInput): Promise<ApiResult<ConfirmedMediaUpload>> {
    const result = await privateClient.POST('/api/v1/media/uploads/confirm', {
      body: input,
    });
    return result;
  }
  static uploadToSignedUrl(uploadUrl: string, file: File): Promise<Response> {
    return fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/webp' },
      body: file,
    });
  }
}
