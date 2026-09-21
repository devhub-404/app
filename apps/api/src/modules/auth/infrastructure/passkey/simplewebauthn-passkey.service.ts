import { Injectable } from '@nestjs/common';
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import {
  PasskeyService,
  type PasskeyAuthenticationOptions,
  type PasskeyAuthenticationResponse,
  type PasskeyCredentialForVerification,
  type PasskeyRegistrationOptions,
  type PasskeyRegistrationResponse,
  type PasskeyRegistrationResult,
} from '@/modules/auth/domain/services/passkey.service';
import { loadPasskeyHelpers, loadPasskeySdk } from '@/modules/auth/infrastructure/auth-sdk';

@Injectable()
export class SimpleWebAuthnPasskeyService implements PasskeyService {
  async generateRegistrationOptions(input: {
    rpID: string;
    rpName: string;
    userID: string;
    userName: string;
    userDisplayName?: string;
    excludeCredentialIDs?: string[];
  }): Promise<{ options: PasskeyRegistrationOptions; challenge: string }> {
    const { generateRegistrationOptions } = loadPasskeySdk();
    const userID = new TextEncoder().encode(input.userID);
    const options = await generateRegistrationOptions({
      rpName: input.rpName,
      rpID: input.rpID,
      userID,
      userName: input.userName,
      userDisplayName: input.userDisplayName ?? input.userName,
      excludeCredentials: (input.excludeCredentialIDs ?? []).map((id) => ({
        id,
        type: 'public-key',
      })),
    });

    return { options: options as unknown as PasskeyRegistrationOptions, challenge: options.challenge };
  }

  async verifyRegistrationResponse(input: {
    response: PasskeyRegistrationResponse;
    expectedChallenge: string;
    expectedOrigin: string | string[];
    expectedRPID: string | string[];
    requireUserVerification?: boolean;
  }): Promise<{ verified: boolean; registration?: PasskeyRegistrationResult }> {
    const { isoBase64URL } = loadPasskeyHelpers();
    const { verifyRegistrationResponse } = loadPasskeySdk();
    const result = await verifyRegistrationResponse({
      response: input.response as unknown as RegistrationResponseJSON,
      expectedChallenge: input.expectedChallenge,
      expectedOrigin: input.expectedOrigin,
      expectedRPID: input.expectedRPID,
      requireUserVerification: input.requireUserVerification ?? true,
    });

    if (!result.verified || !result.registrationInfo) return { verified: false };

    const { credential, credentialDeviceType, credentialBackedUp } = result.registrationInfo;
    const deviceType = credentialDeviceType === 'singleDevice' ? 'single_device' : 'multi_device';

    return {
      verified: true,
      registration: {
        webauthnId: credential.id,
        publicKey: isoBase64URL.fromBuffer(Buffer.from(credential.publicKey)),
        counter: credential.counter,
        deviceType,
        backedUp: credentialBackedUp,
        transports: credential.transports ?? undefined,
      },
    };
  }

  async generateAuthenticationOptions(input: {
    rpID: string;
    allowCredentialIDs?: string[];
  }): Promise<{ options: PasskeyAuthenticationOptions; challenge: string }> {
    const { generateAuthenticationOptions } = loadPasskeySdk();
    const options = await generateAuthenticationOptions({
      rpID: input.rpID,
      allowCredentials: (input.allowCredentialIDs ?? []).map((id) => ({
        id,
        type: 'public-key',
      })),
    });

    return { options: options as unknown as PasskeyAuthenticationOptions, challenge: options.challenge };
  }

  async verifyAuthenticationResponse(input: {
    response: PasskeyAuthenticationResponse;
    expectedChallenge: string;
    expectedOrigin: string | string[];
    expectedRPID: string | string[];
    credential: PasskeyCredentialForVerification;
    requireUserVerification?: boolean;
  }): Promise<{ verified: boolean; newCounter?: number }> {
    const { verifyAuthenticationResponse } = loadPasskeySdk();
    const result = await verifyAuthenticationResponse({
      response: input.response as unknown as AuthenticationResponseJSON,
      expectedChallenge: input.expectedChallenge,
      expectedOrigin: input.expectedOrigin,
      expectedRPID: input.expectedRPID,
      credential: input.credential as unknown as VerifyAuthenticationResponseOpts['credential'],
      requireUserVerification: input.requireUserVerification ?? true,
    });

    if (!result.verified || !result.authenticationInfo) return { verified: false };

    return { verified: true, newCounter: result.authenticationInfo.newCounter };
  }
}
