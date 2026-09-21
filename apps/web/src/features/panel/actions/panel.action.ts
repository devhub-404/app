import { AdminUsersApi } from '@/features/panel/api/panel.api.ts';
import type { SuspendUserDTO, UpdateUserRolesDTO, UserListItemDTO } from '@/features/panel/types/panel.type.ts';
import { toAccountAdminUser } from '@/features/panel/types/account-admin.mapper.type.ts';
import type { Actor } from '@/features/auth/public/access';
import type { ApiClient } from '@/shared/api';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canAccessPanelCapability } from '@/features/panel/access/panel.access.ts';
import {
  canBanAccount,
  canSuspendAccount,
  canUnbanAccount,
  canUnsuspendAccount,
} from '@/features/panel/access/account-moderation.access.ts';
import {
  isAccountBannable,
  isAccountSuspendable,
  isAccountUnbannable,
  isAccountUnsuspendable,
} from '@/features/panel/domain/account-moderation.domain.ts';

const canUsePanel = (capability: Parameters<typeof canAccessPanelCapability>[1]) =>
  isClientAccessAllowed((actor) => canAccessPanelCapability(actor.role, capability));
const deniedMutation = () => Promise.resolve(false);

async function runPanelMutation(request: () => Promise<{ error?: { code?: string } }>): Promise<boolean> {
  try {
    const result = await request();
    return !result.error;
  } catch {
    return false;
  }
}

const emptyUsersPage = (query?: Parameters<typeof AdminUsersApi.list>[0]) => ({
  items: [] satisfies UserListItemDTO[],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 20,
});

export async function listUsersForActor(
  actor: Actor,
  query: Parameters<typeof AdminUsersApi.list>[0],
  client: ApiClient,
) {
  if (!canAccessPanelCapability(actor.role, 'inventory')) return emptyUsersPage(query);
  const { data, error } = await AdminUsersApi.list(query, client);
  if (error) return emptyUsersPage(query);
  const page = data?.data;
  if (!page || !Array.isArray(page.data)) return emptyUsersPage(query);
  return {
    items: page.data,
    total: page.total,
    page: page.page,
    pageSize: page.pageSize,
  };
}

export async function listUsers(query?: Parameters<typeof AdminUsersApi.list>[0]) {
  if (!canUsePanel('inventory')) return emptyUsersPage(query);
  const { data, error } = await AdminUsersApi.list(query);
  if (error) return emptyUsersPage(query);
  const page = data?.data;
  if (!page || !Array.isArray(page.data)) return emptyUsersPage(query);
  return {
    items: page.data,
    total: page.total,
    page: page.page,
    pageSize: page.pageSize,
  };
}

export async function getAdminAccount(id: string) {
  if (!canUsePanel('inventory')) return null;
  const { data, error } = await AdminUsersApi.get(id);
  if (error) return null;
  return toAccountAdminUser(data?.data);
}
export const updateUserRoles = (id: string, payload: UpdateUserRolesDTO) =>
  canUsePanel('roles') ? runPanelMutation(() => AdminUsersApi.updateRoles(id, payload)) : deniedMutation();
export const suspendUser = (actor: Actor, account: UserListItemDTO, payload: SuspendUserDTO) =>
  canSuspendAccount(actor) && isAccountSuspendable(account)
    ? runPanelMutation(() => AdminUsersApi.suspend(account.id, payload))
    : deniedMutation();
export const unsuspendUser = (actor: Actor, account: UserListItemDTO) =>
  canUnsuspendAccount(actor) && isAccountUnsuspendable(account)
    ? runPanelMutation(() => AdminUsersApi.unsuspend(account.id))
    : deniedMutation();
export const banUser = (actor: Actor, account: UserListItemDTO) =>
  canBanAccount(actor) && isAccountBannable(account)
    ? runPanelMutation(() => AdminUsersApi.ban(account.id))
    : deniedMutation();
export const unbanUser = (actor: Actor, account: UserListItemDTO) =>
  canUnbanAccount(actor) && isAccountUnbannable(account)
    ? runPanelMutation(() => AdminUsersApi.unban(account.id))
    : deniedMutation();
export async function getAccountStanding(id: string) {
  if (!canUsePanel('standing')) return null;
  const { data, error } = await AdminUsersApi.getStanding(id);
  return error ? null : (data?.data ?? null);
}
export const restrictAccount = (id: string, payload: Parameters<typeof AdminUsersApi.restrict>[1]) =>
  canUsePanel('restrictions') ? runPanelMutation(() => AdminUsersApi.restrict(id, payload)) : deniedMutation();
export const revokeAccountRestriction = (
  id: string,
  restrictionId: string,
  payload: Parameters<typeof AdminUsersApi.revokeRestriction>[2],
) =>
  canUsePanel('restrictions')
    ? runPanelMutation(() => AdminUsersApi.revokeRestriction(id, restrictionId, payload))
    : deniedMutation();
