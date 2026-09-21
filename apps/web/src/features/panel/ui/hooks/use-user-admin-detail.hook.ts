import { onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { AccountStandingDTO, UserListItemDTO, UserRole } from '@/features/panel/types/panel.type.ts';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import { useAdminUsers } from '@/features/panel/ui/hooks/use-admin-users.hook.ts';
import { getAdminAccount } from '@/features/panel/actions/panel.action.ts';
import { useAuth } from '@/features/auth/public';
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
import { canAccessPanelCapability } from '@/features/panel/access/panel.access.ts';
import { useI18n } from '@/features/panel/i18n';

function toIsoDateTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

export function useUserAdminDetail(id: string) {
  const { t } = useI18n();
  const { role: platformRole } = useAuth();
  const actor = () => ({ accountId: null, role: platformRole(), organizationIds: [], ownerOrganizationIds: [] });
  const admin = useAdminUsers();
  const [state, setState] = createStore({
    loading: true,
    item: null as UserListItemDTO | null,
    role: null as UserRole | null,
    busy: false,
    error: null as string | null,
    success: null as string | null,
    standing: null as AccountStandingDTO | null,
  });

  const clearFeedback = () => {
    setState('error', null);
    setState('success', null);
  };

  const load = async () => {
    setState('loading', true);
    const [found, accountStanding] = await Promise.all([getAdminAccount(id), admin.getAccountStanding(id)]);
    setState('item', found);
    setState('role', found?.role ?? null);
    setState('standing', accountStanding);
    setState('loading', false);
  };

  const run = async (operation: () => Promise<unknown>, refresh = true) => {
    if (state.busy) return false;
    clearFeedback();
    setState('busy', true);
    try {
      const result = await operation();
      if (!result) {
        setState('error', resolveMessage('DEFAULT_ERROR'));
        return false;
      }
      setState('success', resolveMessage('DEFAULT_SUCCESS'));
      if (refresh) await load();
      return true;
    } finally {
      setState('busy', false);
    }
  };

  const saveRole = async () => {
    const current = state.item;
    if (!current || !canAccessPanelCapability(platformRole(), 'roles')) return false;
    return run(() => admin.updateUserRoles(current.id, { role: state.role }), false);
  };

  const restrict = async (capability: 'CONTRIBUTION' | 'COMMENT' | 'VOTE' | 'JOB_PUBLISH', reason: string) => {
    if (!canAccessPanelCapability(platformRole(), 'restrictions')) return false;
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      setState('error', t('useradmindetail.restrictionReasonRequired'));
      return false;
    }
    const changed = await run(
      () =>
        admin.restrictAccount(id, {
          capability,
          reason: normalizedReason,
          startsAt: new Date().toISOString(),
        }),
      false,
    );
    if (changed) setState('standing', await admin.getAccountStanding(id));
    return changed;
  };

  const revokeRestriction = async (restrictionId: string) => {
    if (!canAccessPanelCapability(platformRole(), 'restrictions')) return false;
    const changed = await run(
      () =>
        admin.revokeAccountRestriction(id, restrictionId, { reason: t('useradmindetail.restrictionRevokedFromPanel') }),
      false,
    );
    if (changed) setState('standing', await admin.getAccountStanding(id));
    return changed;
  };

  const suspend = async (until: string) => {
    const current = state.item;
    if (!current || !(canSuspendAccount(actor()) && isAccountSuspendable(current))) return false;
    if (!until) {
      setState('error', t('useradmindetail.enterDataSuspension'));
      return false;
    }
    return run(() => admin.suspendUser(actor(), current, { lockedUntil: toIsoDateTime(until) }));
  };

  const unsuspend = async () => {
    const current = state.item;
    return current && canUnsuspendAccount(actor()) && isAccountUnsuspendable(current)
      ? run(() => admin.unsuspendUser(actor(), current))
      : false;
  };

  const ban = async () => {
    const current = state.item;
    return current && canBanAccount(actor()) && isAccountBannable(current)
      ? run(() => admin.banUser(actor(), current))
      : false;
  };

  const unban = async () => {
    const current = state.item;
    return current && canUnbanAccount(actor()) && isAccountUnbannable(current)
      ? run(() => admin.unbanUser(actor(), current))
      : false;
  };

  const canSuspend = () => {
    const current = state.item;
    return current ? canSuspendAccount(actor()) && isAccountSuspendable(current) : false;
  };
  const canUnsuspend = () => {
    const current = state.item;
    return current ? canUnsuspendAccount(actor()) && isAccountUnsuspendable(current) : false;
  };
  const canBan = () => {
    const current = state.item;
    return current ? canBanAccount(actor()) && isAccountBannable(current) : false;
  };
  const canUnban = () => {
    const current = state.item;
    return current ? canUnbanAccount(actor()) && isAccountUnbannable(current) : false;
  };

  onMount(() => void load());

  return {
    loading: () => state.loading,
    item: () => state.item,
    role: () => state.role,
    setRole: (value: UserRole | null) => setState('role', value),
    busy: () => state.busy,
    error: () => state.error,
    success: () => state.success,
    standing: () => state.standing,
    load,
    saveRole,
    restrict,
    revokeRestriction,
    suspend,
    unsuspend,
    ban,
    unban,
    canSuspend,
    canUnsuspend,
    canBan,
    canUnban,
  };
}
