import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ProfileQueryRepository } from '@/modules/account/application/profile/ports/profile.query.repository';
import { ProfileDTO } from '@/modules/account/application/profile/dtos/out';

@Injectable()
export class GetMyProfileQuery {
  constructor(private readonly profileQueryRepository: ProfileQueryRepository) {}

  async execute(userId: string): Promise<ProfileDTO> {
    const profile = await this.profileQueryRepository.findByUserId(userId);
    if (!profile) throw new AppError('PROFILE_NOT_FOUND');

    return profile;
  }
}
