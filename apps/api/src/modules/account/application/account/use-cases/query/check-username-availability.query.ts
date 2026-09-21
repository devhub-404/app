import { Injectable } from '@nestjs/common';
import { ProfileQueryRepository } from '@/modules/account/application/profile/ports/profile.query.repository';

@Injectable()
export class CheckUsernameAvailabilityQuery {
  constructor(private readonly profileQueryRepository: ProfileQueryRepository) {}

  async execute(username: string): Promise<boolean> {
    return !(await this.profileQueryRepository.existsByUsername(username.trim().toLowerCase()));
  }
}
