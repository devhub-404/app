import { ContactApi } from '../api/contact.api.ts';
import type { ContactBody } from '../types/contact.type.ts';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';

export type SendContactResult = { ok: true } | { ok: false; code: string };

export async function sendContact(body: ContactBody): Promise<SendContactResult> {
  try {
    const result = await ContactApi.send(body);
    if (result.error) {
      const code = result.error.code ?? 'CONTACT_REQUEST_FAILED';
      notifyError(code);
      return { ok: false, code };
    }
    notifySuccess('CONTACT_SENT');
    return { ok: true };
  } catch {
    notifyError('NETWORK_REQUEST_FAILED');
    return { ok: false, code: 'NETWORK_REQUEST_FAILED' };
  }
}
