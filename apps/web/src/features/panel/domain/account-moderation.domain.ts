import type { UserListItemDTO } from '@/features/panel/types/panel.type.ts';

type ModerationState = Pick<UserListItemDTO, 'moderationStatus'>;

export function isAccountSuspendable(account: ModerationState): boolean {
  return account.moderationStatus === 'none';
}

export function isAccountUnsuspendable(account: ModerationState): boolean {
  return account.moderationStatus === 'suspended';
}

export function isAccountBannable(account: ModerationState): boolean {
  return account.moderationStatus !== 'banned';
}

export function isAccountUnbannable(account: ModerationState): boolean {
  return account.moderationStatus === 'banned';
}
