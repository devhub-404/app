import { Injectable } from '@nestjs/common';
import { PreferencesRepository } from '@/modules/account/application/preferences/ports/preferences.repository';

@Injectable()
export class CreateDefaultPreferencesCommand {
  constructor(private readonly preferencesRepository: PreferencesRepository) {}

  async execute(userId: string): Promise<void> {
    await this.preferencesRepository.createDefault(userId);
  }
}
