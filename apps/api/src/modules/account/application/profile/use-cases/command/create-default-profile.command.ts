import { Injectable } from '@nestjs/common';
import { generateUsername } from '@/modules/account/application/shared/generate-username';
import { ProfileRepository } from '@/modules/account/application/profile/ports/profile.repository';
import { ProfileQueryRepository } from '@/modules/account/application/profile/ports/profile.query.repository';
import { AppError } from '@/shared/errors/app-error';

@Injectable()
export class CreateDefaultProfileCommand {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const username = generateUsername();
      const exists = await this.profileQueryRepository.existsByUsername(username);
      if (exists) {
        continue;
      }

      await this.profileRepository.createDefault(userId, username);

      return;
    }

    throw new AppError('PROFILE_ALREADY_EXISTS');
  }
}
