import { createRequire } from 'node:module';

type PasskeySdk = typeof import('@simplewebauthn/server');
type PasskeyHelpers = typeof import('@simplewebauthn/server/helpers');
type OpaqueSdk = typeof import('@serenity-kit/opaque');
type OtplibSdk = typeof import('otplib');

const loadModule = createRequire(import.meta.url);

export function loadPasskeySdk(): PasskeySdk {
  return loadModule('@simplewebauthn/server') as PasskeySdk;
}

export function loadPasskeyHelpers(): PasskeyHelpers {
  return loadModule('@simplewebauthn/server/helpers') as PasskeyHelpers;
}

export function loadOpaqueSdk(): OpaqueSdk {
  return loadModule('@serenity-kit/opaque') as OpaqueSdk;
}

export function loadOtplib(): OtplibSdk {
  return loadModule('otplib') as OtplibSdk;
}
