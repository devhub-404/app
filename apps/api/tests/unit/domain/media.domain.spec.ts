import { describe, expect, it } from 'vitest';
import { MediaObject } from '@/modules/media/domain/media-object';

describe('MediaObject domain', () => {
  it('MEDIA-RN-001 — follows the pending/confirmed/deleted lifecycle', () => {
    const media = MediaObject.create('media-1', {
      ownerAccountId: 'account-1',
      purpose: 'content',
      objectKey: 'content/media-1.webp',
      contentType: 'image/webp',
      size: 1024,
    });

    media.confirm(new Date('2026-01-01T00:00:00.000Z'));
    expect(media.value.status).toBe('confirmed');
    media.delete(new Date('2026-01-02T00:00:00.000Z'));
    expect(media.value.status).toBe('deleted');
    expect(() => media.confirm()).toThrow('MEDIA_OBJECT_DELETED');
  });
});
