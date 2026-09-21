import { describe, expect, it } from 'vitest';
import { Account } from '@/modules/account/domain/entities/account';
import {
  AVATAR_URL_MAX_LENGTH,
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  HEADLINE_MAX_LENGTH,
  LOCATION_MAX_LENGTH,
  PORTFOLIO_URL_MAX_LENGTH,
  Profile,
  SOCIAL_LINK_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from '@/modules/account/domain/entities/profile';
import { DomainError } from '@/shared/errors/domain-error';

describe('Account domain', () => {
  it('creates an active account with independent voluntary, moderation and deletion dimensions', () => {
    const account = Account.create('account-1');

    expect(account.voluntaryStatus).toBe('active');
    expect(account.moderationStatus).toBe('none');
    expect(account.deletionStatus).toBe('none');
    expect(account.deletionRequestedAt).toBeNull();
    expect(account.lockedUntil).toBeNull();
  });

  it('does not reactivate while moderation or deletion restrictions remain', () => {
    const account = Account.create('account-1');
    account.suspend();
    account.requestDeletion(new Date('2026-01-01T00:00:00.000Z'));

    account.deactivate();
    expect(() => account.reactivate()).toThrow(new DomainError('USER_INVALID_STATUS'));

    expect(account.voluntaryStatus).toBe('deactivated');
    expect(account.moderationStatus).toBe('suspended');
    expect(account.deletionStatus).toBe('pending');
  });

  it('rejects repeated or invalid voluntary transitions', () => {
    const account = Account.create('account-1');

    expect(() => account.reactivate()).toThrow(new DomainError('USER_INVALID_STATUS'));
    account.deactivate();
    expect(() => account.deactivate()).toThrow(new DomainError('USER_INVALID_STATUS'));
    account.reactivate();
    expect(account.voluntaryStatus).toBe('active');
  });

  it('supports suspension and clears its lock when unsuspended', () => {
    const lockedUntil = new Date('2026-01-02T00:00:00.000Z');
    const account = Account.create('account-1');

    account.suspend(lockedUntil);
    expect(account.moderationStatus).toBe('suspended');
    expect(account.lockedUntil).toBe(lockedUntil);

    account.unsuspend();
    expect(account.moderationStatus).toBe('none');
    expect(account.lockedUntil).toBeNull();
  });

  it('supports ban and unban independently of voluntary and deletion state', () => {
    const account = Account.create('account-1');
    account.deactivate();
    account.requestDeletion(new Date('2026-01-01T00:00:00.000Z'));

    account.ban();
    expect(account.moderationStatus).toBe('banned');
    expect(account.lockedUntil).toBeNull();

    account.unban();
    expect(account.moderationStatus).toBe('none');
    expect(account.voluntaryStatus).toBe('deactivated');
    expect(account.deletionStatus).toBe('pending');
  });

  it('rejects invalid moderation transitions and repeated bans', () => {
    const account = Account.create('account-1');

    expect(() => account.unsuspend()).toThrow(new DomainError('USER_INVALID_STATUS'));
    expect(() => account.unban()).toThrow(new DomainError('USER_INVALID_STATUS'));

    account.suspend();
    expect(() => account.suspend()).toThrow(new DomainError('USER_INVALID_STATUS'));
    account.unsuspend();
    account.ban();
    expect(() => account.ban()).toThrow(new DomainError('USER_INVALID_STATUS'));
  });

  it('requests and cancels deletion without changing other dimensions', () => {
    const requestedAt = new Date('2026-01-01T00:00:00.000Z');
    const account = Account.create('account-1');
    account.deactivate();
    account.suspend();

    account.requestDeletion(requestedAt);
    expect(account.deletionStatus).toBe('pending');
    expect(account.deletionRequestedAt).toBe(requestedAt);

    account.cancelDeletion();
    expect(account.deletionStatus).toBe('none');
    expect(account.deletionRequestedAt).toBeNull();
    expect(account.voluntaryStatus).toBe('deactivated');
    expect(account.moderationStatus).toBe('suspended');
  });

  it('rejects repeated deletion requests and cancellation without pending deletion', () => {
    const account = Account.create('account-1');

    expect(() => account.cancelDeletion()).toThrow(new DomainError('USER_INVALID_STATUS'));
    account.requestDeletion();
    expect(() => account.requestDeletion()).toThrow(new DomainError('USER_INVALID_STATUS'));
  });
});

describe('Profile domain', () => {
  const validProfile = () =>
    Profile.create('account-1', {
      username: 'void-user',
      displayName: 'Void User',
      socialLinks: { githubUrl: 'https://github.com/void-user' },
    });

  it('creates a profile with nullable optional fields and normalized social links', () => {
    const profile = Profile.create('account-1', {
      username: 'void-user',
      socialLinks: { githubUrl: 'https://github.com/void-user', linkedinUrl: undefined },
    });

    expect(profile.userId).toBe('account-1');
    expect(profile.username).toBe('void-user');
    expect(profile.displayName).toBeNull();
    expect(profile.socialLinks).toEqual({
      githubUrl: 'https://github.com/void-user',
      linkedinUrl: null,
      twitterUrl: null,
    });
  });

  it('normalizes an empty social-links object to null', () => {
    expect(Profile.create('account-1', { username: 'void-user', socialLinks: {} }).socialLinks).toBeNull();
  });

  it('updates profile fields without changing its owning account', () => {
    const profile = validProfile();

    profile.update({ displayName: 'Updated User', socialLinks: { twitterUrl: 'https://x.com/void-user' } });

    expect(profile.userId).toBe('account-1');
    expect(profile.displayName).toBe('Updated User');
    expect(profile.socialLinks).toEqual({
      githubUrl: null,
      linkedinUrl: null,
      twitterUrl: 'https://x.com/void-user',
    });
  });

  it.each([
    ['username', USERNAME_MAX_LENGTH, { username: 'x'.repeat(USERNAME_MAX_LENGTH + 1) }],
    ['displayName', DISPLAY_NAME_MAX_LENGTH, { username: 'u', displayName: 'x'.repeat(DISPLAY_NAME_MAX_LENGTH + 1) }],
    ['headline', HEADLINE_MAX_LENGTH, { username: 'u', headline: 'x'.repeat(HEADLINE_MAX_LENGTH + 1) }],
    ['bio', BIO_MAX_LENGTH, { username: 'u', bio: 'x'.repeat(BIO_MAX_LENGTH + 1) }],
    ['location', LOCATION_MAX_LENGTH, { username: 'u', location: 'x'.repeat(LOCATION_MAX_LENGTH + 1) }],
    ['avatarUrl', AVATAR_URL_MAX_LENGTH, { username: 'u', avatarUrl: 'x'.repeat(AVATAR_URL_MAX_LENGTH + 1) }],
    [
      'portfolioUrl',
      PORTFOLIO_URL_MAX_LENGTH,
      { username: 'u', portfolioUrl: 'x'.repeat(PORTFOLIO_URL_MAX_LENGTH + 1) },
    ],
    [
      'social link',
      SOCIAL_LINK_MAX_LENGTH,
      { username: 'u', socialLinks: { githubUrl: 'x'.repeat(SOCIAL_LINK_MAX_LENGTH + 1) } },
    ],
  ])('rejects an oversized %s value at the domain boundary', (_field, _max, input) => {
    expect(() => Profile.create('account-1', input)).toThrow(DomainError);
  });

  it('rejects an empty username', () => {
    expect(() => Profile.create('account-1', { username: '' })).toThrow(
      new DomainError('USER_PROFILE_INVALID_USERNAME'),
    );
  });
});
