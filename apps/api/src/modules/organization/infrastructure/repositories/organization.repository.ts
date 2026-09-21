import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { resolveUniqueSlug } from '@/shared/kernel/slug/unique-slug';
import { AccountProfileReadPort } from '@/modules/account/public/account-profile-read.port';
import {
  organizationsSchema,
  organizationMembershipsSchema,
} from '@/shared/infrastructure/database/drizzle/schema/user/organization/organizations.schema';
import {
  OrganizationRepository,
  type OrganizationWithMembership,
} from '../../application/ports/organization.repository';
import { OrganizationQueryRepository } from '../../application/ports/organization.query.repository';
import { Organization } from '../../domain/organization';
import type {
  CreateOrganizationDTO,
  ListOrganizationsDTO,
  OrganizationDTO,
  OrganizationMembershipDTO,
  OrganizationRole,
  PaginatedOrganizationsDTO,
} from '../../application/dtos';

@Injectable()
export class DrizzleOrganizationRepository implements OrganizationRepository, OrganizationQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly profiles: AccountProfileReadPort,
  ) {}

  async findAggregateById(id: string): Promise<Organization | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const memberships = await this.db
      .select({ accountId: organizationMembershipsSchema.accountId, role: organizationMembershipsSchema.role })
      .from(organizationMembershipsSchema)
      .where(eq(organizationMembershipsSchema.organizationId, id));

    return Organization.rehydrate({ ...current, memberships });
  }

  async saveAggregate(organization: Organization): Promise<boolean> {
    const state = organization.snapshot();
    const [row] = await this.db
      .update(organizationsSchema)
      .set({
        name: state.name,
        type: state.type,
        description: state.description,
        websiteUrl: state.websiteUrl,
        avatarUrl: state.avatarUrl,
        status: state.status,
        deletedAt: state.deletedAt,
        updatedAt: state.updatedAt,
      })
      .where(and(eq(organizationsSchema.id, state.id), isNull(organizationsSchema.deletedAt)))
      .returning({ id: organizationsSchema.id });

    return Boolean(row);
  }

  transaction<T>(work: (context: unknown) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => work(tx));
  }

  async createWithOwner(accountId: string, input: CreateOrganizationDTO): Promise<OrganizationDTO> {
    return this.db.transaction(async (tx) => {
      const slug = await resolveUniqueSlug(
        input.name,
        async (candidate) => {
          const rows = await tx
            .select({ id: organizationsSchema.id })
            .from(organizationsSchema)
            .where(eq(organizationsSchema.slug, candidate))
            .limit(1);

          return rows.length > 0;
        },
        180,
        'organization',
      );
      const [organization] = await tx
        .insert(organizationsSchema)
        .values({ ...input, slug, createdByAccountId: accountId })
        .returning();
      if (!organization) throw new Error('ORGANIZATION_NOT_PERSISTED');
      await tx
        .insert(organizationMembershipsSchema)
        .values({ organizationId: organization.id, accountId, role: 'owner' });

      return organization;
    });
  }

  async listPublic(input: ListOrganizationsDTO): Promise<PaginatedOrganizationsDTO> {
    const filters = [eq(organizationsSchema.status, 'active'), isNull(organizationsSchema.deletedAt)];
    if (input.search)
      filters.push(
        or(
          ilike(organizationsSchema.name, `%${input.search}%`),
          ilike(organizationsSchema.description, `%${input.search}%`),
        )!,
      );
    const rowsQuery = this.db
      .select({
        id: organizationsSchema.id,
        name: organizationsSchema.name,
        slug: organizationsSchema.slug,
        type: organizationsSchema.type,
        description: organizationsSchema.description,
        websiteUrl: organizationsSchema.websiteUrl,
        avatarUrl: organizationsSchema.avatarUrl,
        createdByAccountId: organizationsSchema.createdByAccountId,
        status: organizationsSchema.status,
        createdAt: organizationsSchema.createdAt,
        updatedAt: organizationsSchema.updatedAt,
        total: sql<number>`count(*) over()`,
      })
      .from(organizationsSchema)
      .where(and(...filters))
      .orderBy(asc(organizationsSchema.name))
      .limit(input.pageSize)
      .offset((input.page - 1) * input.pageSize);
    const rows = await rowsQuery.$withCache({ config: { ex: 300 }, autoInvalidate: true });

    return {
      items: rows.map(({ total: _total, ...row }) => row),
      page: input.page,
      pageSize: input.pageSize,
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async getBySlug(slug: string): Promise<OrganizationDTO | null> {
    const [row] = await this.db
      .select()
      .from(organizationsSchema)
      .where(
        and(
          eq(organizationsSchema.slug, slug),
          eq(organizationsSchema.status, 'active'),
          isNull(organizationsSchema.deletedAt),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  async findPublicBySlug(slug: string): Promise<OrganizationDTO | null> {
    return this.getBySlug(slug);
  }

  async getById(id: string): Promise<OrganizationDTO | null> {
    const [row] = await this.db
      .select()
      .from(organizationsSchema)
      .where(and(eq(organizationsSchema.id, id), isNull(organizationsSchema.deletedAt)))
      .limit(1);

    return row ?? null;
  }

  async findById(id: string): Promise<OrganizationDTO | null> {
    return this.getById(id);
  }

  async listByAccount(accountId: string): Promise<OrganizationWithMembership[]> {
    const rows = await this.db
      .select({ organization: organizationsSchema, role: organizationMembershipsSchema.role })
      .from(organizationMembershipsSchema)
      .innerJoin(organizationsSchema, eq(organizationsSchema.id, organizationMembershipsSchema.organizationId))
      .where(and(eq(organizationMembershipsSchema.accountId, accountId), isNull(organizationsSchema.deletedAt)))
      .orderBy(asc(organizationsSchema.name));

    return rows.map(({ organization, role }) => ({ ...organization, membershipRole: role }));
  }

  async listMembers(organizationId: string): Promise<OrganizationMembershipDTO[]> {
    const rows = await this.db
      .select()
      .from(organizationMembershipsSchema)
      .where(eq(organizationMembershipsSchema.organizationId, organizationId))
      .orderBy(asc(organizationMembershipsSchema.createdAt));

    return this.withMemberProfiles(rows);
  }

  async addMember(
    organizationId: string,
    accountId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMembershipDTO | null> {
    const [row] = await this.db
      .insert(organizationMembershipsSchema)
      .values({ organizationId, accountId, role })
      .onConflictDoNothing()
      .returning();

    return row ? ((await this.withMemberProfiles([row]))[0] ?? null) : null;
  }

  async changeMemberRole(
    organizationId: string,
    accountId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMembershipDTO | null> {
    return this.db.transaction(async (tx) => {
      tx.select({ lock: sql`pg_advisory_xact_lock(hashtextextended(${organizationId}, 31))` });
      const [current] = await tx
        .select()
        .from(organizationMembershipsSchema)
        .where(
          and(
            eq(organizationMembershipsSchema.organizationId, organizationId),
            eq(organizationMembershipsSchema.accountId, accountId),
          ),
        )
        .limit(1);
      if (!current) return null;
      if (current.role === 'owner' && role !== 'owner') {
        const [owners] = await tx
          .select({ value: count() })
          .from(organizationMembershipsSchema)
          .where(
            and(
              eq(organizationMembershipsSchema.organizationId, organizationId),
              eq(organizationMembershipsSchema.role, 'owner'),
            ),
          );
        if (Number(owners?.value ?? 0) <= 1) return null;
      }
      const [updated] = await tx
        .update(organizationMembershipsSchema)
        .set({ role, updatedAt: new Date().toISOString() })
        .where(
          and(
            eq(organizationMembershipsSchema.organizationId, organizationId),
            eq(organizationMembershipsSchema.accountId, accountId),
          ),
        )
        .returning();

      return updated ? ((await this.withMemberProfiles([updated]))[0] ?? null) : null;
    });
  }

  async removeMember(organizationId: string, accountId: string): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      tx.select({ lock: sql`pg_advisory_xact_lock(hashtextextended(${organizationId}, 31))` });
      const [current] = await tx
        .select()
        .from(organizationMembershipsSchema)
        .where(
          and(
            eq(organizationMembershipsSchema.organizationId, organizationId),
            eq(organizationMembershipsSchema.accountId, accountId),
          ),
        )
        .limit(1);
      if (!current) return false;
      if (current.role === 'owner') {
        const [owners] = await tx
          .select({ value: count() })
          .from(organizationMembershipsSchema)
          .where(
            and(
              eq(organizationMembershipsSchema.organizationId, organizationId),
              eq(organizationMembershipsSchema.role, 'owner'),
            ),
          );
        if (Number(owners?.value ?? 0) <= 1) return false;
      }
      const removed = await tx
        .delete(organizationMembershipsSchema)
        .where(
          and(
            eq(organizationMembershipsSchema.organizationId, organizationId),
            eq(organizationMembershipsSchema.accountId, accountId),
          ),
        )
        .returning({ accountId: organizationMembershipsSchema.accountId });

      return removed.length > 0;
    });
  }

  async getMembershipRole(organizationId: string, accountId: string): Promise<OrganizationRole | null> {
    const [row] = await this.db
      .select({ role: organizationMembershipsSchema.role })
      .from(organizationMembershipsSchema)
      .where(
        and(
          eq(organizationMembershipsSchema.organizationId, organizationId),
          eq(organizationMembershipsSchema.accountId, accountId),
        ),
      )
      .limit(1);

    return row?.role ?? null;
  }

  private async withMemberProfiles(
    rows: Array<typeof organizationMembershipsSchema.$inferSelect>,
  ): Promise<OrganizationMembershipDTO[]> {
    const profiles = await this.profiles.getProfilesByAccountIds(rows.map((row) => row.accountId));

    return rows.map((row) => {
      const profile = profiles[row.accountId];

      return {
        ...row,
        username: profile?.username ?? null,
        displayName: profile?.displayName ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
      };
    });
  }

  async listPublicMembershipsByAccount(
    accountId: string,
    limit = 50,
  ): Promise<Array<OrganizationDTO & { membershipRole: OrganizationRole }>> {
    const rows = await this.db
      .select({
        id: organizationsSchema.id,
        name: organizationsSchema.name,
        slug: organizationsSchema.slug,
        type: organizationsSchema.type,
        description: organizationsSchema.description,
        websiteUrl: organizationsSchema.websiteUrl,
        avatarUrl: organizationsSchema.avatarUrl,
        createdByAccountId: organizationsSchema.createdByAccountId,
        status: organizationsSchema.status,
        createdAt: organizationsSchema.createdAt,
        updatedAt: organizationsSchema.updatedAt,
        membershipRole: organizationMembershipsSchema.role,
      })
      .from(organizationMembershipsSchema)
      .innerJoin(organizationsSchema, eq(organizationsSchema.id, organizationMembershipsSchema.organizationId))
      .where(
        and(
          eq(organizationMembershipsSchema.accountId, accountId),
          eq(organizationsSchema.status, 'active'),
          isNull(organizationsSchema.deletedAt),
        ),
      )
      .orderBy(desc(organizationMembershipsSchema.createdAt))
      .limit(limit);

    return rows;
  }
}
