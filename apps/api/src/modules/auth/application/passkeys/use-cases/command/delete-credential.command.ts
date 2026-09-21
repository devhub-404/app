import { Injectable } from '@nestjs/common';
import { CredentialRepository } from '@/modules/auth/application/shared/ports/credential.repository';
import { AppError } from '@/shared/errors/app-error';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';

@Injectable()
export class DeleteCredentialCommand {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
  ) {}

  async execute(userId: string, sessionId: string, credentialId: string): Promise<void> {
    await this.requirePossessionProofCommand.execute(userId, sessionId);

    const credential = await this.credentialRepository.findById(credentialId);
    if (!credential || credential.userId !== userId || credential.type === 'password') {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
    if ((await this.credentialRepository.countByUserId(userId)) <= 1) {
      throw new AppError('USER_LAST_CREDENTIAL');
    }

    await this.credentialRepository.deleteById(credentialId);
  }
}
