import type { OrganizationMembership } from '@/features/organization/types/organization.type.ts';

export type OrganizationLifecycleState = 'active' | 'archived';

export function isOrganizationActive(organization: { status: OrganizationLifecycleState }): boolean {
  return organization.status === 'active';
}

export function hasAnotherOwner(members: OrganizationMembership[], accountId: string): boolean {
  return members.some((member) => member.role === 'owner' && member.accountId !== accountId);
}
