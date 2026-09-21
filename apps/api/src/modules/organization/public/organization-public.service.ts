import { Injectable } from '@nestjs/common';
import { OrganizationQueryRepository } from '../application/ports';

export type OrganizationPublicMembership = {
  id: string;
  name: string;
  slug: string;
  type: string;
  avatarUrl: string | null;
  membershipRole: 'owner' | 'admin' | 'member';
};

export type OrganizationPublicSummary = {
  id: string;
  name: string;
  slug: string;
  type: string;
  avatarUrl: string | null;
};

export abstract class OrganizationPublicServicePort {
  abstract getById(id: string): Promise<OrganizationPublicSummary | null>;
  abstract listPublicMembershipsByAccount(accountId: string, limit?: number): Promise<OrganizationPublicMembership[]>;
}

@Injectable()
export class OrganizationPublicService implements OrganizationPublicServicePort {
  constructor(private readonly repository: OrganizationQueryRepository) {}

  async getById(id: string): Promise<OrganizationPublicSummary | null> {
    const organization = await this.repository.findById(id);
    if (!organization || organization.status !== 'active') return null;

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      type: organization.type,
      avatarUrl: organization.avatarUrl,
    };
  }

  async listPublicMembershipsByAccount(accountId: string, limit = 20): Promise<OrganizationPublicMembership[]> {
    const rows = await this.repository.listPublicMembershipsByAccount(accountId);

    return rows.slice(0, Math.min(50, Math.max(1, limit))).map((organization) => ({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      type: organization.type,
      avatarUrl: organization.avatarUrl,
      membershipRole: organization.membershipRole,
    }));
  }
}
