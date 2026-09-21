export const AUTH_CONFIG = Symbol('AUTH_CONFIG');

export type AuthConfig = {
  secureCookies: boolean;
  siteUrl: string;
  jwtSecret: string;
  auth: {
    opaqueServerSetup: string;
    totpSecretEncryptionKeyBase64: string;
    passkeyRpId: string;
    passkeyRpName: string;
    passkeyOrigin: string;
  };
  oauth: {
    github: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      linkRedirectUri: string;
    };
    google: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      linkRedirectUri: string;
    };
  };
};
