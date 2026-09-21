import { DomainError } from '@/shared/errors/domain-error';

export type OrganizationStatus = 'active' | 'archived';
export type OrganizationRole = 'owner' | 'admin' | 'member';
export type OrganizationType =
  'company' | 'community' | 'open_source' | 'foundation' | 'group' | 'institution' | 'other';
export type OrganizationMembershipState = { accountId: string; role: OrganizationRole };
export type OrganizationState = {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  description: string;
  websiteUrl: string | null;
  avatarUrl: string | null;
  createdByAccountId: string;
  status: OrganizationStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  memberships: OrganizationMembershipState[];
};

export class Organization {
  private constructor(private readonly state: OrganizationState) {}

  static rehydrate(state: OrganizationState): Organization {
    return new Organization({ ...state, memberships: [...state.memberships] });
  }

  addMember(accountId: string, role: OrganizationRole): void {
    this.ensureActive();
    if (this.state.memberships.some((member) => member.accountId === accountId))
      throw new DomainError('ORGANIZATION_MEMBER_ALREADY_EXISTS');
    this.state.memberships.push({ accountId, role });
  }

  changeMemberRole(accountId: string, role: OrganizationRole): void {
    this.ensureActive();
    const member = this.state.memberships.find((candidate) => candidate.accountId === accountId);
    if (!member) throw new DomainError('ORGANIZATION_MEMBER_NOT_FOUND');
    if (member.role === 'owner' && role !== 'owner' && this.ownerCount() <= 1)
      throw new DomainError('ORGANIZATION_LAST_OWNER');
    member.role = role;
  }

  removeMember(accountId: string): void {
    this.ensureActive();
    const member = this.state.memberships.find((candidate) => candidate.accountId === accountId);
    if (!member) throw new DomainError('ORGANIZATION_MEMBER_NOT_FOUND');
    if (member.role === 'owner' && this.ownerCount() <= 1) throw new DomainError('ORGANIZATION_LAST_OWNER');
    this.state.memberships = this.state.memberships.filter((candidate) => candidate.accountId !== accountId);
  }

  private ownerCount(): number {
    return this.state.memberships.filter((member) => member.role === 'owner').length;
  }

  update(input: Partial<Pick<OrganizationState, 'name' | 'type' | 'description' | 'websiteUrl' | 'avatarUrl'>>): void {
    this.ensureActive();
    if (input.name !== undefined && (input.name.trim().length < 2 || input.name.trim().length > 160))
      throw new DomainError('ORGANIZATION_INVALID_NAME');
    if (input.description !== undefined && (input.description.length < 1 || input.description.length > 10000))
      throw new DomainError('ORGANIZATION_INVALID_DESCRIPTION');
    Object.assign(this.state, input);
    if (input.name !== undefined) this.state.name = input.name.trim();
    this.touch();
  }

  archive(): void {
    this.ensureNotDeleted();
    if (this.state.status !== 'active') throw new DomainError('ORGANIZATION_INVALID_STATUS');
    this.state.status = 'archived';
    this.touch();
  }

  unarchive(): void {
    this.ensureNotDeleted();
    if (this.state.status !== 'archived') throw new DomainError('ORGANIZATION_INVALID_STATUS');
    this.state.status = 'active';
    this.touch();
  }

  delete(): void {
    if (this.state.deletedAt) throw new DomainError('ORGANIZATION_DELETED');
    this.state.deletedAt = new Date().toISOString();
    this.touch();
  }

  snapshot(): OrganizationState {
    return { ...this.state };
  }

  private ensureActive(): void {
    this.ensureNotDeleted();
    if (this.state.status !== 'active') throw new DomainError('ORGANIZATION_ARCHIVED');
  }

  private ensureNotDeleted(): void {
    if (this.state.deletedAt) throw new DomainError('ORGANIZATION_DELETED');
  }

  private touch(): void {
    this.state.updatedAt = new Date().toISOString();
  }
}
