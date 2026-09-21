import { Injectable } from '@nestjs/common';
import { CredentialPasskeyRepository } from '@/modules/auth/application/passkeys/ports/credential-passkey.repository';
import { PasskeyDeviceDTO } from '@/modules/auth/application/passkeys/dtos/out/passkey-device.dto';

@Injectable()
export class ListPasskeyDevicesQuery {
  constructor(private readonly repository: CredentialPasskeyRepository) {}

  async execute(userId: string): Promise<PasskeyDeviceDTO[]> {
    const devices = await this.repository.listByUserId(userId);

    return devices.map((device) => ({
      credentialId: device.credentialId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      backedUp: device.backedUp,
      transports: device.transports,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
      lastUsedAt: device.lastUsedAt,
    }));
  }
}
