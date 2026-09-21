import { Injectable } from '@nestjs/common';
import { CredentialPasskeyRepository } from '@/modules/auth/application/passkeys/ports/credential-passkey.repository';
import { CredentialRepository } from '@/modules/auth/application/shared/ports/credential.repository';
import { AppError } from '@/shared/errors/app-error';

@Injectable()
export class UpdatePasskeyDeviceNameCommand {
  constructor(
    private readonly credentialPasskeyRepository: CredentialPasskeyRepository,
    private readonly credentialRepository: CredentialRepository,
  ) {}

  async execute(userId: string, credentialId: string, deviceName: string): Promise<void> {
    const credential = await this.credentialRepository.findById(credentialId);

    if (!credential || credential.userId !== userId || credential.type !== 'passkey') {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    await this.credentialPasskeyRepository.updateDeviceName(credentialId, deviceName);
  }
}
