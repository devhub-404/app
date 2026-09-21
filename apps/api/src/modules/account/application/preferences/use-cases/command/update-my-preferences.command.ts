import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { PreferencesRepository } from '@/modules/account/application/preferences/ports/preferences.repository';
import { UpdateAccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/in';
import { PreferencesQueryRepository } from '@/modules/account/application/preferences/ports/preferences.query.repository';
import { AccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/out';

@Injectable()
export class UpdateMyPreferencesCommand {
  constructor(
    private readonly preferencesRepository: PreferencesRepository,
    private readonly preferencesQueryRepository: PreferencesQueryRepository,
  ) {}

  async execute(userId: string, payload: UpdateAccountPreferencesDTO): Promise<AccountPreferencesDTO> {
    const updated = await this.preferencesRepository.update(userId, payload);
    if (!updated) {
      throw new AppError('USER_PREFERENCES_NOT_FOUND');
    }

    const preferences = await this.preferencesQueryRepository.findByUserId(userId);
    if (!preferences) {
      throw new AppError('USER_PREFERENCES_NOT_FOUND');
    }

    return preferences;
  }
}
