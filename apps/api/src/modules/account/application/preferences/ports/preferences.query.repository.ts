import { AccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/out';

export abstract class PreferencesQueryRepository {
  abstract findByUserId(userId: string): Promise<AccountPreferencesDTO | null>;
}
