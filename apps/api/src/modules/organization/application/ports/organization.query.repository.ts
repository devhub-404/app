import type {
  ListOrganizationsDTO,
  MyOrganizationDTO,
  OrganizationDTO,
  OrganizationMembershipDTO,
  PaginatedOrganizationsDTO,
} from '../dtos';

export abstract class OrganizationQueryRepository {
  abstract listPublic(input: ListOrganizationsDTO): Promise<PaginatedOrganizationsDTO>;
  abstract findPublicBySlug(slug: string): Promise<OrganizationDTO | null>;
  abstract findById(id: string): Promise<OrganizationDTO | null>;
  abstract listByAccount(accountId: string): Promise<MyOrganizationDTO[]>;
  abstract listMembers(organizationId: string): Promise<OrganizationMembershipDTO[]>;
  abstract getMembershipRole(organizationId: string, accountId: string): Promise<'owner' | 'admin' | 'member' | null>;
  abstract listPublicMembershipsByAccount(
    accountId: string,
    limit?: number,
  ): Promise<Array<OrganizationDTO & { membershipRole: 'owner' | 'admin' | 'member' }>>;
}
