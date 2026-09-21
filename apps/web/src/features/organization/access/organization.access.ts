import type { OrganizationRole } from '@/features/organization/types/organization.type.ts';
import type { Actor } from '../../auth/public/access.ts';

export function canManageOrganization(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canEditOrganization(organizationId: string, actor: Actor): boolean {
  return actor.organizationIds.includes(organizationId);
}

export function canArchiveOrganization(organizationId: string, actor: Actor): boolean {
  return actor.ownerOrganizationIds?.includes(organizationId) ?? false;
}

export function canUnarchiveOrganization(organizationId: string, actor: Actor): boolean {
  return actor.ownerOrganizationIds?.includes(organizationId) ?? false;
}

export function canManageOrganizationMemberships(organizationId: string, actor: Actor): boolean {
  return actor.ownerOrganizationIds?.includes(organizationId) ?? false;
}

export function canDeleteOrganization(organizationId: string, actor: Actor): boolean {
  return actor.ownerOrganizationIds?.includes(organizationId) ?? false;
}
