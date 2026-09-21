export abstract class OpaquePasswordService {
  abstract createRegistrationResponse(input: {
    userIdentifier: string;
    registrationRequest: string;
  }): Promise<{ registrationResponse: string }>;

  abstract startLogin(input: {
    userIdentifier: string;
    registrationRecord: string | null;
    startLoginRequest: string;
  }): Promise<{ serverLoginState: string; loginResponse: string }>;

  abstract finishLogin(input: {
    serverLoginState: string;
    finishLoginRequest: string;
  }): Promise<{ sessionKey: string }>;

  abstract getServerPublicKey(registrationRecord: string): Promise<string>;
}
