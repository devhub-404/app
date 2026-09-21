import { privateClient } from '@/shared/api';
import type { ApiClient, ApiResult } from '@/shared/api';
import type {
  AccountStandingDTO,
  AccountRestrictionDTO,
  SuspendUserDTO,
  UsersListQuery,
  UpdateUserRolesDTO,
  UsersPageDTO,
  RestrictAccountCapabilityDTO,
  RevokeAccountRestrictionDTO,
} from '@/features/panel/types/panel.type.ts';

export class AdminUsersApi {
  static async list(query?: UsersListQuery, client: ApiClient = privateClient): Promise<ApiResult<UsersPageDTO>> {
    const result = await client.GET('/api/v1/accounts', {
      params: { query },
    });
    return result;
  }

  static async get(id: string): Promise<ApiResult<unknown>> {
    return privateClient.GET('/api/v1/accounts/{id}', { params: { path: { id } } });
  }

  static async updateRoles(id: string, payload: UpdateUserRolesDTO): Promise<ApiResult<unknown>> {
    const result = await privateClient.PATCH('/api/v1/accounts/{id}/roles', {
      params: { path: { id } },
      body: { role: payload.role },
    });
    return result;
  }

  static async suspend(id: string, payload: SuspendUserDTO): Promise<ApiResult<unknown>> {
    const result = await privateClient.POST('/api/v1/accounts/{id}/suspend', {
      params: { path: { id } },
      body: { lockedUntil: payload.lockedUntil },
    });
    return result;
  }

  static async unsuspend(id: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.POST('/api/v1/accounts/{id}/unsuspend', {
      params: { path: { id } },
    });
    return result;
  }

  static async ban(id: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.POST('/api/v1/accounts/{id}/ban', {
      params: { path: { id } },
    });
    return result;
  }

  static async unban(id: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.POST('/api/v1/accounts/{id}/unban', {
      params: { path: { id } },
    });
    return result;
  }

  static async getStanding(id: string): Promise<ApiResult<AccountStandingDTO>> {
    const result = await privateClient.GET('/api/v1/moderation/accounts/{accountId}/standing', {
      params: { path: { accountId: id } },
    });
    return result;
  }

  static async restrict(id: string, payload: RestrictAccountCapabilityDTO): Promise<ApiResult<AccountRestrictionDTO>> {
    const result = await privateClient.POST('/api/v1/moderation/accounts/{accountId}/restrictions', {
      params: { path: { accountId: id } },
      body: payload,
    });
    return result;
  }

  static async revokeRestriction(
    id: string,
    restrictionId: string,
    payload: RevokeAccountRestrictionDTO,
  ): Promise<ApiResult<AccountRestrictionDTO>> {
    const result = await privateClient.POST(
      '/api/v1/moderation/accounts/{accountId}/restrictions/{restrictionId}/revoke',
      { params: { path: { accountId: id, restrictionId } }, body: payload },
    );
    return result;
  }
}
