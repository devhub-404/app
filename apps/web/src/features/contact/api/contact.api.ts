import { publicClient, type ApiResult } from '@/shared/api';
import type { ContactBody } from '@/features/contact/types/contact.type.ts';

export class ContactApi {
  static send(body: ContactBody): Promise<ApiResult<unknown>> {
    return publicClient.POST('/api/v1/contact', { body });
  }
}
