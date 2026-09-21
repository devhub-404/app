import { DomainError } from '@/shared/errors/domain-error';

export const CONTACT_MESSAGE_TYPES = ['institutional', 'legal', 'support'] as const;
export type ContactMessageType = (typeof CONTACT_MESSAGE_TYPES)[number];

const CONTACT_MESSAGE_TYPE_SET = new Set<string>(CONTACT_MESSAGE_TYPES);

/**
 * CONTACT-RN-001/002/003.
 * Keeps the semantic acceptance rules for Contact in the domain while DTOs
 * remain responsible for transport-shape validation.
 */
export class ContactSubmissionPolicy {
  static supportsType(value: string): value is ContactMessageType {
    return CONTACT_MESSAGE_TYPE_SET.has(value);
  }

  static assertType(value: string): asserts value is ContactMessageType {
    if (!this.supportsType(value)) throw new DomainError('CONTACT_INVALID_TYPE');
  }

  static assertReplyEmail(value: string | null | undefined): asserts value is string {
    if (!value?.trim()) throw new DomainError('CONTACT_EMAIL_REQUIRED');
  }

  static normalizeContextUrl(value: string, siteUrl: string): string {
    let contextUrl: URL;
    let site: URL;
    try {
      contextUrl = new URL(value);
      site = new URL(siteUrl);
    } catch {
      throw new DomainError('INVALID_URL');
    }

    if (contextUrl.origin !== site.origin) throw new DomainError('INVALID_URL');

    return contextUrl.toString();
  }
}
