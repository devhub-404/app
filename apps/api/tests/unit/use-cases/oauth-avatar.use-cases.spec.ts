import { describe, expect, it, vi } from 'vitest';
import { ImportOAuthAvatarOnAccountCreatedListener } from '@/modules/account/application/profile/listeners/import-oauth-avatar-on-account-created.listener';
import { Profile } from '@/modules/account/domain/entities/profile';
import { AccountCreatedEvent } from '@/modules/account/public/events';

function makeProfile(avatarMediaId: string | null = null) {
  return Profile.create('user-1', {
    username: 'user_1',
    displayName: null,
    avatarUrl: null,
    avatarMediaId,
    headline: null,
    bio: null,
    location: null,
    portfolioUrl: null,
    socialLinks: null,
  });
}

describe('OAuth avatar provisioning', () => {
  it('imports and associates the provider avatar for a new account', async () => {
    const profile = makeProfile();
    const save = vi.fn(async () => undefined);
    const importOAuthAvatar = vi.fn(async () => ({ mediaId: 'media-1', objectKey: 'avatars/media-1.webp', url: null }));
    const listener = new ImportOAuthAvatarOnAccountCreatedListener(
      { findById: async () => profile, save } as never,
      { importOAuthAvatar, deleteImage: vi.fn() } as never,
    );

    await listener.handle(
      new AccountCreatedEvent('user-1', {
        source: 'oauth',
        provider: 'google',
        avatarUrl: 'https://lh3.googleusercontent.com/avatar',
      }),
    );

    expect(importOAuthAvatar).toHaveBeenCalledWith({
      ownerId: 'user-1',
      purpose: 'avatar',
      source: 'oauth',
      provider: 'google',
      sourceUrl: 'https://lh3.googleusercontent.com/avatar',
    });
    expect(profile.avatarMediaId).toBe('media-1');
    expect(save).toHaveBeenCalledOnce();
  });

  it('does not import when the profile already has an avatar', async () => {
    const importOAuthAvatar = vi.fn();
    const listener = new ImportOAuthAvatarOnAccountCreatedListener(
      { findById: async () => makeProfile('media-existing') } as never,
      { importOAuthAvatar } as never,
    );

    await listener.handle(
      new AccountCreatedEvent('user-1', {
        source: 'oauth',
        provider: 'github',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
      }),
    );

    expect(importOAuthAvatar).not.toHaveBeenCalled();
  });

  it('does nothing for account creation without OAuth avatar metadata', async () => {
    const profileRepository = { findById: vi.fn() };
    const listener = new ImportOAuthAvatarOnAccountCreatedListener(profileRepository as never, {} as never);

    await listener.handle(new AccountCreatedEvent('user-1'));

    expect(profileRepository.findById).not.toHaveBeenCalled();
  });
});
