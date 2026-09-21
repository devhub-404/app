export type PasskeyRegistrationOptions = Record<string, unknown>;

export type PasskeyAuthenticationOptions = Record<string, unknown>;

export type PasskeyRegistrationResponse = Record<string, unknown>;

export type PasskeyAuthenticationResponse = Record<string, unknown>;

export type PasskeyDeviceType = 'single_device' | 'multi_device';

export type PasskeyCredentialForVerification = {
  id: string;
  publicKey: Buffer;
  counter: number;
  transports?: string[] | undefined;
};

export type PasskeyRegistrationResult = {
  webauthnId: string;
  publicKey: string;
  counter: number;
  deviceType: PasskeyDeviceType;
  backedUp: boolean;
  transports?: string[] | undefined;
};

export abstract class PasskeyService {
  abstract generateRegistrationOptions(input: {
    rpID: string;
    rpName: string;
    userID: string;
    userName: string;
    userDisplayName?: string;
    excludeCredentialIDs?: string[];
  }): Promise<{ options: PasskeyRegistrationOptions; challenge: string }>;

  abstract verifyRegistrationResponse(input: {
    response: PasskeyRegistrationResponse;
    expectedChallenge: string;
    expectedOrigin: string | string[];
    expectedRPID: string | string[];
    requireUserVerification?: boolean;
  }): Promise<{ verified: boolean; registration?: PasskeyRegistrationResult }>;

  abstract generateAuthenticationOptions(input: {
    rpID: string;
    allowCredentialIDs?: string[];
  }): Promise<{ options: PasskeyAuthenticationOptions; challenge: string }>;

  abstract verifyAuthenticationResponse(input: {
    response: PasskeyAuthenticationResponse;
    expectedChallenge: string;
    expectedOrigin: string | string[];
    expectedRPID: string | string[];
    credential: PasskeyCredentialForVerification;
    requireUserVerification?: boolean;
  }): Promise<{ verified: boolean; newCounter?: number }>;
}
