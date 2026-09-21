import { Role } from '@/shared/kernel/auth/role';

const PRIVILEGED_ROLES = new Set<Role>([Role.CURATOR, Role.MODERATOR, Role.ADMIN]);

function isPrivilegedRole(role: string): role is Role {
  return PRIVILEGED_ROLES.has(role as Role);
}

/**
 * Roles belong to Account. Login resolves the Account's current assignments and
 * uses them only to establish the session invariant; policies resolve current
 * roles from Account on each authenticated request.
 * Privileged roles are effective only when MFA is enabled; by Auth invariant, any
 * valid Session that exists for an MFA-enabled Account has already completed MFA.
 */
export function resolveEffectiveSessionRole(assignedRole: string | null, mfaEnabled: boolean): Role | null {
  if (!mfaEnabled) return null;

  if (assignedRole && isPrivilegedRole(assignedRole)) return assignedRole;

  return null;
}
