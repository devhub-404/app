import type { components } from '@devhub-404/api-contract';
import { publicClient, type ApiResult } from '@/shared/api';

type AccountReactivationResponseDTO = components['schemas']['SessionOrMfaChallengeDTO'];
type AccountDeletionCancelResponseDTO = components['schemas']['GenericPublicAckDTO'];

export class AccountLifecycleApi {
  static reactivate(token: string): Promise<ApiResult<AccountReactivationResponseDTO>> {
    return publicClient.POST('/api/v1/account/reactivate', {
      body: { token },
      credentials: 'include',
    });
  }

  static cancelDeletion(token: string): Promise<ApiResult<AccountDeletionCancelResponseDTO>> {
    return publicClient.POST('/api/v1/account/deletion/cancel', {
      body: { token },
    });
  }
}
