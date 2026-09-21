import type { PasskeyDeviceType } from '@/modules/auth/domain/services/passkey.service';

export type PasskeyCredentialRow = {
  credentialId: string;
  userId: string;
  webauthnId: string;
  publicKey: string;
  counter: number;
  deviceType: PasskeyDeviceType;
  backedUp: boolean;
  transports: string[] | null;
  deviceName: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
};

export abstract class CredentialPasskeyRepository {
  abstract create(input: {
    credentialId: string;
    webauthnId: string;
    publicKey: string;
    counter: number;
    deviceType: PasskeyDeviceType;
    backedUp: boolean;
    transports: string[] | null;
    deviceName: string | null;
  }): Promise<void>;

  /** Advances the WebAuthn sign counter monotonically; stale writers are ignored. */
  abstract updateCounter(id: string, counter: number): Promise<void>;
  abstract updateDeviceName(id: string, deviceName: string): Promise<void>;
  abstract findByWebauthnId(webauthnId: string): Promise<PasskeyCredentialRow | null>;
  abstract listWebauthnIdsByUserId(userId: string): Promise<string[]>;
  abstract listByUserId(userId: string): Promise<PasskeyCredentialRow[]>;
}
