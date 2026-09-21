import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient } from '@/shared/api';
import type { components } from '@devhub-404/api-contract';
import type {
  CreateOrganizationInput,
  Organization,
  MyOrganization,
  OrganizationMembership,
  PaginatedOrganizations,
  OrganizationRole,
  UpdateOrganizationInput,
} from '@/features/organization/types/organization.type.ts';
export type {
  CreateOrganizationInput,
  Organization,
  OrganizationMembership,
  PaginatedOrganizations,
  OrganizationRole,
  UpdateOrganizationInput,
} from '@/features/organization/types/organization.type.ts';

type ApiResponse<T> = { data?: { data?: T }; error?: unknown; response?: Response };
type RequestOptions = { signal?: AbortSignal; client?: ApiClient };

function unwrap<T>(result: ApiResponse<T>): T {
  if (result.error) {
    const error = new Error('ORGANIZATION_REQUEST_FAILED') as Error & { status?: number };
    error.status = result.response?.status;
    throw error;
  }
  return result.data?.data as T;
}

export const organizationApi = {
  async list(
    query?: { search?: string; page?: number; pageSize?: number },
    options?: RequestOptions,
  ): Promise<PaginatedOrganizations> {
    return unwrap(await publicClient.GET('/api/v1/organizations', { params: { query }, signal: options?.signal }));
  },
  async get(slug: string, options?: RequestOptions): Promise<Organization> {
    return unwrap(
      await (options?.client ?? publicClient).GET('/api/v1/organizations/{slug}', {
        params: { path: { slug } },
        signal: options?.signal,
      }),
    );
  },
  async mine(): Promise<MyOrganization[]> {
    return unwrap(await privateClient.GET('/api/v1/organizations/me'));
  },
  async create(body: CreateOrganizationInput): Promise<Organization> {
    return unwrap(await privateClient.POST('/api/v1/organizations', { body }));
  },
  async update(id: string, body: UpdateOrganizationInput): Promise<Organization> {
    return unwrap(await privateClient.PATCH('/api/v1/organizations/{id}', { params: { path: { id } }, body }));
  },
  async delete(id: string): Promise<void> {
    unwrap(await privateClient.DELETE('/api/v1/organizations/{id}', { params: { path: { id } } }));
  },
  async archive(id: string): Promise<Organization> {
    return unwrap(await privateClient.POST('/api/v1/organizations/{id}/archive', { params: { path: { id } } }));
  },
  async unarchive(id: string): Promise<Organization> {
    return unwrap(await privateClient.POST('/api/v1/organizations/{id}/unarchive', { params: { path: { id } } }));
  },
  async members(id: string, options?: RequestOptions): Promise<OrganizationMembership[]> {
    return unwrap(
      await privateClient.GET('/api/v1/organizations/{id}/members', {
        params: { path: { id } },
        signal: options?.signal,
      }),
    );
  },
  async addMember(id: string, accountId: string, role: OrganizationRole): Promise<OrganizationMembership> {
    const body: components['schemas']['AddOrganizationMemberDTO'] = { accountId, role };
    return unwrap(await privateClient.POST('/api/v1/organizations/{id}/members', { params: { path: { id } }, body }));
  },
  async changeRole(id: string, accountId: string, role: OrganizationRole): Promise<OrganizationMembership> {
    const body: components['schemas']['ChangeOrganizationMemberRoleDTO'] = { role };
    return unwrap(
      await privateClient.PATCH('/api/v1/organizations/{id}/members/{accountId}', {
        params: { path: { id, accountId } },
        body,
      }),
    );
  },
  async removeMember(id: string, accountId: string): Promise<void> {
    unwrap(
      await privateClient.DELETE('/api/v1/organizations/{id}/members/{accountId}', {
        params: { path: { id, accountId } },
      }),
    );
  },
  async leave(id: string): Promise<void> {
    unwrap(await privateClient.POST('/api/v1/organizations/{id}/leave', { params: { path: { id } } }));
  },
};
