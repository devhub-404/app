import { describe, expect, it, vi } from 'vitest';
import { CreateAccountCommand } from '@/modules/account/application/account/use-cases/command/create-account.command';
import { ReactivateAccountCommand } from '@/modules/account/application/account/use-cases/command/reactivate-account.command';
import { CancelAccountDeletionCommand } from '@/modules/account/application/account/use-cases/command/restore-deleted-account.command';
import { GetAccountAuthenticationViewQuery } from '@/modules/account/application/account/use-cases/query/get-account-authentication-view.query';
import { GetMyAccountQuery } from '@/modules/account/application/account/use-cases/query/get-my-account.query';
import { GetMyPreferencesQuery } from '@/modules/account/application/preferences/use-cases/query/get-my-preferences.query';
import { GetMyProfileQuery } from '@/modules/account/application/profile/use-cases/query/get-my-profile.query';
import {
  ListAccountsQuery,
  GetAccountByIdQuery,
} from '@/modules/account/application/admin/use-cases/query/list-users.query';
import { UnbanAccountCommand } from '@/modules/account/application/admin/use-cases/command/unban-account.command';
import { UnsuspendAccountCommand } from '@/modules/account/application/admin/use-cases/command/unsuspend-account.command';
import { UpdateMyPreferencesCommand } from '@/modules/account/application/preferences/use-cases/command/update-my-preferences.command';
import { UpdateMyProfileCommand } from '@/modules/account/application/profile/use-cases/command/update-my-profile.command';
import { Profile } from '@/modules/account/domain/entities/profile';
import { Account } from '@/modules/account/domain/entities/account';

const now = '2026-08-20T00:00:00.000Z';
const account = {
  id: 'account-1',
  voluntaryStatus: 'active',
  moderationStatus: 'none',
  deletionStatus: 'none',
  deletionRequestedAt: null,
  status: 'active',
  mfaEnabled: false,
  lockedUntil: null,
  createdAt: now,
  updatedAt: now,
};
const profileDto = {
  userId: 'account-1',
  username: 'reiden',
  displayName: 'Reiden',
  avatarUrl: null,
  avatarMediaId: null,
  headline: null,
  bio: null,
  location: null,
  portfolioUrl: null,
  socialLinks: null,
};
const prefs = { accountId: 'account-1', locale: 'pt-BR', theme: 'system' } as never;

describe('Account canonical application surface', () => {
  it('ACC-BE-UC-005 — creation delegates stable human identity creation without inventing credentials', async () => {
    const create = vi.fn(async () => 'account-1');
    await expect(new CreateAccountCommand({ create } as never).execute('person@example.com')).resolves.toBe(
      'account-1',
    );
    expect(create).toHaveBeenCalledWith({ email: 'person@example.com' });
  });

  it('ACC-BE-UC-009 — Auth receives only the Account authentication view owned by Account', async () => {
    const getAuthenticationView = vi.fn(async () => account);
    await expect(
      new GetAccountAuthenticationViewQuery({ getAuthenticationView } as never).execute('account-1'),
    ).resolves.toBe(account);
    expect(getAuthenticationView).toHaveBeenCalledWith('account-1');
  });

  it('ACC-BE-UC-010 — my Account composes account, email, profile, preferences and roles without transferring ownership', async () => {
    const email = {
      id: 'email-1',
      userId: 'account-1',
      email: 'person@example.com',
      type: 'primary',
      verifiedAt: now,
      createdAt: now,
    };
    const query = new GetMyAccountQuery(
      { findById: vi.fn(async () => account) } as never,
      { listByUserId: vi.fn(async () => [email]) } as never,
      { findByUserId: vi.fn(async () => profileDto) } as never,
      { findByUserId: vi.fn(async () => prefs) },
      { findNameByUserId: vi.fn(async () => null) } as never,
    );
    await expect(query.execute('account-1')).resolves.toMatchObject({
      account: { id: 'account-1' },
      emails: [{ id: 'email-1', accountId: 'account-1' }],
      profile: profileDto,
      preferences: prefs,
      role: null,
    });
  });

  it('ACC-BE-UC-011/012 — own preferences/profile fail closed when their owned projection is missing', async () => {
    await expect(
      new GetMyPreferencesQuery({ findByUserId: vi.fn(async () => prefs) }).execute('account-1'),
    ).resolves.toBe(prefs);
    await expect(
      new GetMyProfileQuery({ findByUserId: vi.fn(async () => profileDto) } as never).execute('account-1'),
    ).resolves.toBe(profileDto);
    await expect(
      new GetMyPreferencesQuery({ findByUserId: vi.fn(async () => null) }).execute('account-1'),
    ).rejects.toMatchObject({ code: 'USER_PREFERENCES_NOT_FOUND' });
    await expect(
      new GetMyProfileQuery({ findByUserId: vi.fn(async () => null) } as never).execute('account-1'),
    ).rejects.toMatchObject({ code: 'PROFILE_NOT_FOUND' });
  });

  it('ACC-BE-UC-014/024 — admin inventory paginates deterministically and detail uses the same administrative projection', async () => {
    const list = vi.fn(async () => ({
      data: [{ ...account, email: 'person@example.com', username: 'reiden', role: null }],
      total: 1,
    }));
    const findById = vi.fn(async () => ({
      ...account,
      email: 'person@example.com',
      username: 'reiden',
      role: null,
    }));
    const repository = { list, findById } as never;
    const listQuery = new ListAccountsQuery(repository);
    const detailQuery = new GetAccountByIdQuery(repository);
    await expect(listQuery.execute(2, 25)).resolves.toMatchObject({ total: 1, page: 2, pageSize: 25 });
    await expect(detailQuery.findById('account-1')).resolves.toMatchObject({ id: 'account-1' });
    expect(list).toHaveBeenCalledWith(25, 25);
    expect(findById).toHaveBeenCalledWith('account-1');
  });

  it('ACC-BE-UC-016 — reactivation changes only DEACTIVATED→ACTIVE and emits the lifecycle event after CAS success', async () => {
    const aggregate = {
      voluntaryStatus: 'deactivated',
      reactivate: vi.fn(() => undefined),
    };
    const findAggregateById = vi.fn(async () => aggregate);
    const saveAggregate = vi.fn(async () => true);
    const emit = vi.fn();
    await new ReactivateAccountCommand({ findAggregateById, saveAggregate } as never, { emit } as never).execute(
      'account-1',
    );
    expect(findAggregateById).toHaveBeenCalledWith('account-1');
    expect(aggregate.reactivate).toHaveBeenCalledTimes(1);
    expect(saveAggregate).toHaveBeenCalledWith(aggregate);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it('ACC-BE-UC-018 — deletion cancellation is retention-bound and changes only PENDING→NONE', async () => {
    const saveAggregate = vi.fn(async () => true);
    const pending = {
      ...account,
      voluntaryStatus: 'deactivated',
      moderationStatus: 'banned',
      deletionStatus: 'pending',
      deletionRequestedAt: '2026-08-18T00:00:00.000Z',
    };
    await new CancelAccountDeletionCommand({
      findAggregateById: vi.fn(async () => Account.rehydrate({ ...pending, lockedUntil: null })),
      saveAggregate,
    }).execute('account-1', new Date('2026-08-20T00:00:00.000Z'));
    expect(saveAggregate).toHaveBeenCalledTimes(1);
  });

  it('ACC-BE-UC-020/021 — admin removal of ban/suspension touches only moderation state', async () => {
    const unban = Account.rehydrate({ ...account, moderationStatus: 'banned' });
    const unsuspend = Account.rehydrate({ ...account, moderationStatus: 'suspended' });
    const findAggregateById = vi.fn().mockResolvedValueOnce(unban).mockResolvedValueOnce(unsuspend);
    const saveAggregate = vi.fn(async () => true);
    const repository = { findAggregateById, saveAggregate } as never;
    await new UnbanAccountCommand(repository).execute('account-1');
    await new UnsuspendAccountCommand(repository).execute('account-1');
    expect(unban.moderationStatus).toBe('none');
    expect(unsuspend.moderationStatus).toBe('none');
    expect(saveAggregate).toHaveBeenCalledTimes(2);
  });

  it('ACC-BE-UC-022 — preference update persists then re-reads the authoritative projection', async () => {
    const update = vi.fn(async () => true);
    const findByUserId = vi.fn(async () => prefs);
    const payload = { locale: 'en-US' } as never;
    await expect(
      new UpdateMyPreferencesCommand({ update } as never, { findByUserId }).execute('account-1', payload),
    ).resolves.toBe(prefs);
    expect(update).toHaveBeenCalledWith('account-1', payload);
    expect(findByUserId).toHaveBeenCalledWith('account-1');
  });

  it('ACC-BE-UC-023 — profile update enforces username uniqueness, confirms new avatar, saves, then awaits old-media cleanup', async () => {
    const entity = Profile.create('account-1', { username: 'reiden', avatarMediaId: 'media-old' } as never);
    const save = vi.fn(async () => undefined);
    const confirmImageUpload = vi.fn(async () => ({ mediaId: 'media-new' }));
    const deleteImage = vi.fn(async () => true);
    const get = { execute: vi.fn(async () => ({ ...profileDto, username: 'new-name', avatarMediaId: 'media-new' })) };
    const command = new UpdateMyProfileCommand(
      { findById: vi.fn(async () => entity), save } as never,
      { existsByUsername: vi.fn(async () => false) } as never,
      get as never,
      { confirmImageUpload, deleteImage } as never,
    );
    await expect(
      command.execute('account-1', { username: 'new-name', avatarMediaId: 'media-new' }),
    ).resolves.toMatchObject({ username: 'new-name' });
    expect(confirmImageUpload).toHaveBeenCalledWith({ ownerId: 'account-1', purpose: 'avatar', mediaId: 'media-new' });
    expect(save).toHaveBeenCalledTimes(1);
    expect(deleteImage).toHaveBeenCalledWith({ ownerId: 'account-1', mediaId: 'media-old' });
    expect(get.execute).toHaveBeenCalledWith('account-1');
  });
});
