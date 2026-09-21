import { UpdateAccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/in';

export abstract class PreferencesRepository {
  abstract update(userId: string, patch: UpdateAccountPreferencesDTO): Promise<boolean>;
  abstract createDefault(userId: string): Promise<void>;
}
