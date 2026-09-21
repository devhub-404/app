import {
  listUsers,
  updateUserRoles,
  suspendUser,
  unsuspendUser,
  banUser,
  unbanUser,
  getAccountStanding,
  restrictAccount,
  revokeAccountRestriction,
} from '@/features/panel/actions/panel.action.ts';

export function useAdminUsers() {
  return {
    listUsers,
    updateUserRoles,
    suspendUser,
    unsuspendUser,
    banUser,
    unbanUser,
    getAccountStanding,
    restrictAccount,
    revokeAccountRestriction,
  };
}
