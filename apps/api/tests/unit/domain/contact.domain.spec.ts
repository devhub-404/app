import { describe, expect, it } from 'vitest';
import { ContactSubmissionPolicy } from '@/modules/contact/domain';

describe('Contact domain', () => {
  it('CONTACT-RN-001/002 accepts only formal contact types and requires a reply email', () => {
    expect(ContactSubmissionPolicy.supportsType('institutional')).toBe(true);
    expect(ContactSubmissionPolicy.supportsType('legal')).toBe(true);
    expect(ContactSubmissionPolicy.supportsType('support')).toBe(true);
    expect(ContactSubmissionPolicy.supportsType('bug')).toBe(false);
    expect(() => ContactSubmissionPolicy.assertReplyEmail('person@example.com')).not.toThrow();
    expect(() => ContactSubmissionPolicy.assertReplyEmail(' ')).toThrow();
  });

  it('CONTACT-RN-003 preserves only same-origin context URLs', () => {
    expect(
      ContactSubmissionPolicy.normalizeContextUrl('https://devhub-404.example/contact?q=1', 'https://devhub-404.example'),
    ).toBe('https://devhub-404.example/contact?q=1');
    expect(() =>
      ContactSubmissionPolicy.normalizeContextUrl('https://outside.example/', 'https://devhub-404.example'),
    ).toThrow();
  });
});
