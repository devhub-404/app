import type { AuthConfig } from '@/modules/auth/public/auth-config.port';
import type { ContactConfig } from '@/modules/contact/public/contact-config.port';
import type { MediaConfig } from '@/modules/media/public/media-config.port';

export const authConfig: AuthConfig = {
  secureCookies: false,
  siteUrl: 'https://devhub-404.example',
  jwtSecret: 'test-secret',
  auth: {
    opaqueServerSetup: 'test-opaque-setup',
    totpSecretEncryptionKeyBase64: Buffer.alloc(32).toString('base64'),
    passkeyRpId: 'devhub-404.example',
    passkeyRpName: 'DevHub',
    passkeyOrigin: 'https://devhub-404.example',
  },
  oauth: {
    github: {
      clientId: 'github-id',
      clientSecret: 'github-secret',
      redirectUri: 'https://devhub-404.example/oauth/github',
      linkRedirectUri: 'https://devhub-404.example/oauth/github/link',
    },
    google: {
      clientId: 'google-id',
      clientSecret: 'google-secret',
      redirectUri: 'https://devhub-404.example/oauth/google',
      linkRedirectUri: 'https://devhub-404.example/oauth/google/link',
    },
  },
};

export const mediaConfig: MediaConfig = {
  storage: {
    bucket: 'test-bucket',
    endpoint: 'https://storage.example',
    accessKeyId: 'access',
    secretAccessKey: 'secret',
    publicBaseUrl: 'https://cdn.example/',
  },
  upload: {
    grantTtlSeconds: 3600,
    allowedContentTypes: ['image/webp'],
    maxBytes: { avatar: 5_000_000, content: 10_000_000 },
  },
};

export const contactConfig: ContactConfig = {
  siteUrl: 'https://devhub-404.example',
  recipientAddress: 'contact@devhub-404.example',
};
