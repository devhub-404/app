import { Injectable } from '@nestjs/common';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { FailedLoginHandlingResultDTO } from '@/modules/auth/application/auth/dtos/out/failed-login-handling-result.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class HandleFailedLoginCommand {
  constructor(private readonly credentialPasswordRepository: CredentialPasswordRepository) {}

  async execute(userId: string): Promise<FailedLoginHandlingResultDTO> {
    const credentialPassword = await this.credentialPasswordRepository.findByUserId(userId);
    if (!credentialPassword) {
      return { counted: false, locked: false, failedAttempts: 0, lockedUntil: null };
    }

    const nextFailedAttempts = credentialPassword.failedAttempts + 1;
    await this.credentialPasswordRepository.incrementFailedAttempts(credentialPassword.credentialId);

    if (nextFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      await this.credentialPasswordRepository.setLockedUntil(credentialPassword.credentialId, lockedUntil);

      return {
        counted: true,
        locked: true,
        failedAttempts: nextFailedAttempts,
        lockedUntil,
      };
    }

    return {
      counted: true,
      locked: false,
      failedAttempts: nextFailedAttempts,
      lockedUntil: null,
    };
  }
}
