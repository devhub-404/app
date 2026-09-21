import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { UserMeQueryRepository } from '@/modules/auth/application/auth/ports/user-me.query.repository';
import type { UserMeDTO } from '@/modules/auth/application/auth/dtos/out/user-me.dto';
import { GetCurrentUserInputDTO } from '@/modules/auth/application/auth/dtos/in';

@Injectable()
export class GetCurrentUserQuery {
  constructor(private readonly userMeQueryRepository: UserMeQueryRepository) {}

  async execute(params: GetCurrentUserInputDTO): Promise<UserMeDTO> {
    const result = await this.userMeQueryRepository.findByUserIdAndSessionId(params.userId, params.sessionId);

    if (!result) {
      throw new AppError('USER_NOT_FOUND');
    }

    return result;
  }
}
