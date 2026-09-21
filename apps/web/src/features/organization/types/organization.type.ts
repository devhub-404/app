import type { components } from '@devhub-404/api-contract';

export type OrganizationRole = components['schemas']['OrganizationMembershipDTO']['role'];
export type Organization = components['schemas']['OrganizationDTO'];
export type MyOrganization = components['schemas']['MyOrganizationDTO'];
export type OrganizationMembership = components['schemas']['OrganizationMembershipDTO'];
export type PaginatedOrganizations = components['schemas']['PaginatedOrganizationsDTO'];
export type CreateOrganizationInput = components['schemas']['CreateOrganizationDTO'];
export type UpdateOrganizationInput = components['schemas']['UpdateOrganizationDTO'];
