import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { PreferencesQueryRepository } from '@/modules/account/application/preferences/ports/preferences.query.repository';
import { AccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/out';

@Injectable()
export class GetMyPreferencesQuery {
  constructor(private readonly preferencesQueryRepository: PreferencesQueryRepository) {}

  async execute(userId: string): Promise<AccountPreferencesDTO> {
    const prefs = await this.preferencesQueryRepository.findByUserId(userId);
    if (!prefs) {
      throw new AppError('USER_PREFERENCES_NOT_FOUND');
    }

    return prefs;
  }
}
