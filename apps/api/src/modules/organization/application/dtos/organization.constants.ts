export const ORGANIZATION_TYPES = [
  'company',
  'community',
  'open_source',
  'foundation',
  'group',
  'institution',
  'other',
] as const;
export const ORGANIZATION_ROLES = ['owner', 'admin', 'member'] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];
