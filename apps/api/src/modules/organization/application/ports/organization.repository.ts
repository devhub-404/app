import type {
  CreateOrganizationDTO,
  ListOrganizationsDTO,
  MyOrganizationDTO,
  OrganizationDTO,
  OrganizationMembershipDTO,
  OrganizationRole,
  PaginatedOrganizationsDTO,
} from '../dtos';
import type { Organization } from '../../domain/organization';

export type OrganizationWithMembership = MyOrganizationDTO;

export abstract class OrganizationRepository {
  abstract findAggregateById(id: string): Promise<Organization | null>;
  abstract saveAggregate(organization: Organization): Promise<boolean>;
  abstract transaction<T>(work: (context: unknown) => Promise<T>): Promise<T>;
  abstract createWithOwner(accountId: string, input: CreateOrganizationDTO): Promise<OrganizationDTO>;
  abstract listPublic(input: ListOrganizationsDTO): Promise<PaginatedOrganizationsDTO>;
  abstract getBySlug(slug: string): Promise<OrganizationDTO | null>;
  abstract getById(id: string): Promise<OrganizationDTO | null>;
  abstract listByAccount(accountId: string): Promise<OrganizationWithMembership[]>;
  abstract listMembers(organizationId: string): Promise<OrganizationMembershipDTO[]>;
  abstract addMember(
    organizationId: string,
    accountId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMembershipDTO | null>;
  abstract changeMemberRole(
    organizationId: string,
    accountId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMembershipDTO | null>;
  abstract removeMember(organizationId: string, accountId: string): Promise<boolean>;
  abstract getMembershipRole(organizationId: string, accountId: string): Promise<OrganizationRole | null>;
  abstract listPublicMembershipsByAccount(
    accountId: string,
    limit?: number,
  ): Promise<Array<OrganizationDTO & { membershipRole: OrganizationRole }>>;
}
