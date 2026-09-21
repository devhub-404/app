import { isDisposableEmail } from 'disposable-email-domains-js';
import { AppError } from '@/shared/errors/app-error';

/**
 * Rejects addresses from the maintained disposable-domain blocklist.
 *
 * This policy is intentionally applied only when an address is introduced or
 * changed. Existing identities must still be able to authenticate and recover
 * access if a domain later becomes classified as disposable.
 */
export function assertEmailAddressCanBeUsedForIdentity(email: string): void {
  if (isDisposableEmail(email)) {
    throw new AppError('DISPOSABLE_EMAIL_NOT_ALLOWED');
  }
}
