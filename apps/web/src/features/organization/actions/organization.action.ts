import { organizationApi } from '../api/organization.api.ts';
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationMembership,
  OrganizationRole,
  PaginatedOrganizations,
  UpdateOrganizationInput,
  MyOrganization,
} from '../types/organization.type.ts';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';

type RequestOptions = { signal?: AbortSignal; client?: import('@/shared/api').ApiClient };
export type OrganizationResult<T> = { ok: true; data: T } | { ok: false; code: string; status?: number };

async function result<T>(task: () => Promise<T>): Promise<OrganizationResult<T>> {
  try {
    return { ok: true, data: await task() };
  } catch (error) {
    return {
      ok: false,
      code: 'ORGANIZATION_REQUEST_FAILED',
      status: error instanceof Error && 'status' in error ? (error as Error & { status?: number }).status : undefined,
    };
  }
}

export function listOrganizationsQuery(
  query?: { search?: string; page?: number; pageSize?: number },
  options?: RequestOptions,
): Promise<OrganizationResult<PaginatedOrganizations>> {
  return result(() => organizationApi.list(query, options));
}

export function getOrganizationQuery(
  slug: string,
  options?: RequestOptions,
): Promise<OrganizationResult<Organization>> {
  return result(() => organizationApi.get(slug, options));
}

export function listMyOrganizationsQuery(): Promise<OrganizationResult<MyOrganization[]>> {
  return result(() => organizationApi.mine());
}

export async function listMyOrganizations(): Promise<MyOrganization[]> {
  const response = await listMyOrganizationsQuery();
  return response.ok ? response.data : [];
}

export async function createOrganizationCommand(body: CreateOrganizationInput): Promise<OrganizationResult<Organization>> {
  const response = await result(() => organizationApi.create(body));
  if (response.ok) notifySuccess('ORGANIZATION_CREATED');
  else notifyError(response.code);
  return response;
}

export function updateOrganizationCommand(
  id: string,
  body: UpdateOrganizationInput,
): Promise<OrganizationResult<Organization>> {
  return result(() => organizationApi.update(id, body));
}

export function deleteOrganizationCommand(id: string): Promise<OrganizationResult<void>> {
  return result(() => organizationApi.delete(id));
}

export function archiveOrganizationCommand(id: string): Promise<OrganizationResult<Organization>> {
  return result(() => organizationApi.archive(id));
}

export function unarchiveOrganizationCommand(id: string): Promise<OrganizationResult<Organization>> {
  return result(() => organizationApi.unarchive(id));
}

export function listOrganizationMembersQuery(
  id: string,
  options?: RequestOptions,
): Promise<OrganizationResult<OrganizationMembership[]>> {
  return result(() => organizationApi.members(id, options));
}

export function addOrganizationMemberCommand(
  id: string,
  accountId: string,
  role: OrganizationRole,
): Promise<OrganizationResult<OrganizationMembership>> {
  return result(() => organizationApi.addMember(id, accountId, role));
}

export function changeOrganizationMemberRoleCommand(
  id: string,
  accountId: string,
  role: OrganizationRole,
): Promise<OrganizationResult<OrganizationMembership>> {
  return result(() => organizationApi.changeRole(id, accountId, role));
}

export function removeOrganizationMemberCommand(id: string, accountId: string): Promise<OrganizationResult<void>> {
  return result(() => organizationApi.removeMember(id, accountId));
}

export function leaveOrganizationCommand(id: string): Promise<OrganizationResult<void>> {
  return result(() => organizationApi.leave(id));
}
