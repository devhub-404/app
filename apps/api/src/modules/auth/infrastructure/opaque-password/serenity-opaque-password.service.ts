import { Inject, Injectable } from '@nestjs/common';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { loadOpaqueSdk } from '@/modules/auth/infrastructure/auth-sdk';

@Injectable()
export class SerenityOpaquePasswordService implements OpaquePasswordService {
  constructor(@Inject(AUTH_CONFIG) config: AuthConfig) {
    this.serverSetup = config.auth.opaqueServerSetup;
  }

  private readonly serverSetup: string;

  private async ensureReady(): Promise<void> {
    const { ready } = loadOpaqueSdk();
    await ready;
  }

  async createRegistrationResponse(input: {
    userIdentifier: string;
    registrationRequest: string;
  }): Promise<{ registrationResponse: string }> {
    await this.ensureReady();
    const { server } = loadOpaqueSdk();
    if (!this.serverSetup) throw new Error('Missing env OPAQUE_SERVER_SETUP');
    const result = server.createRegistrationResponse({
      serverSetup: this.serverSetup,
      userIdentifier: input.userIdentifier,
      registrationRequest: input.registrationRequest,
    });

    return { registrationResponse: result.registrationResponse };
  }

  async startLogin(input: {
    userIdentifier: string;
    registrationRecord: string | null;
    startLoginRequest: string;
  }): Promise<{ serverLoginState: string; loginResponse: string }> {
    await this.ensureReady();
    const { server } = loadOpaqueSdk();
    if (!this.serverSetup) throw new Error('Missing env OPAQUE_SERVER_SETUP');
    const result = server.startLogin({
      serverSetup: this.serverSetup,
      userIdentifier: input.userIdentifier,
      registrationRecord: input.registrationRecord,
      startLoginRequest: input.startLoginRequest,
    });

    return { serverLoginState: result.serverLoginState, loginResponse: result.loginResponse };
  }

  async finishLogin(input: { serverLoginState: string; finishLoginRequest: string }): Promise<{ sessionKey: string }> {
    await this.ensureReady();
    const { server } = loadOpaqueSdk();
    const result = server.finishLogin({
      serverLoginState: input.serverLoginState,
      finishLoginRequest: input.finishLoginRequest,
    });

    return { sessionKey: result.sessionKey };
  }

  async getServerPublicKey(_registrationRecord: string): Promise<string> {
    await this.ensureReady();
    const { server } = loadOpaqueSdk();

    return server.getPublicKey(this.serverSetup);
  }
}
